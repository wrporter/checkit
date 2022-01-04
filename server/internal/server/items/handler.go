package items

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/wrporter/games-app/server/internal/server"
	"github.com/wrporter/games-app/server/internal/server/auth"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/limit"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"github.com/wrporter/games-app/server/internal/server/validate"
	"net/http"
	"time"
)

const ParamItemID = "itemID"

type (
	ItemRequest struct {
		Text string `json:"text" validate:"required,max=250"`
	}
	ItemUpdateStatusRequest struct {
		Status store.ItemStatus `json:"status" validate:"required,itemStatus"`
	}

	ItemResponse struct {
		ID            string     `json:"id"`
		Text          string     `json:"text"`
		DateCreated   *time.Time `json:"dateCreated,omitempty"`
		DateCompleted *time.Time `json:"dateCompleted,omitempty"`
	}
)

func RegisterRoutes(s *server.Server) {
	group := s.Router.Group("/api").Use(limit.WithRateLimit())
	{
		group.GET("/items",
			auth.RequireAuth(s.SessionManager.Manager),
			GetItems(s),
		)
		group.POST("/items",
			auth.RequireAuth(s.SessionManager.Manager),
			validate.RequestBody(ItemRequest{}),
			PostItem(s),
		)
		group.DELETE("/items/completed",
			auth.RequireAuth(s.SessionManager.Manager),
			DeleteCompletedItems(s),
		)
		group.POST(fmt.Sprintf("/items/:%s", ParamItemID),
			auth.RequireAuth(s.SessionManager.Manager),
			validate.RequestBody(ItemUpdateStatusRequest{}),
			UpdateItemStatus(s),
		)
	}
}

func DeleteCompletedItems(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := session.Get(s.SessionManager, c.Request.Context())
		err := s.Store.DeleteCompletedItems(c.Request.Context(), sess.ID)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
		}
		c.Writer.WriteHeader(http.StatusNoContent)
	}
}

func UpdateItemStatus(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := session.Get(s.SessionManager, c.Request.Context())
		body := validate.GetRequestBody(c).(*ItemUpdateStatusRequest)

		itemID := c.Params.ByName(ParamItemID)
		err := s.Store.UpdateItemStatus(c.Request.Context(), sess.ID, itemID, body.Status)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
		}
		c.Writer.WriteHeader(http.StatusNoContent)
	}
}

func GetItems(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := session.Get(s.SessionManager, c.Request.Context())

		items, err := s.Store.GetItemsForUser(c.Request.Context(), sess.ID)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
			return
		}

		response := make([]ItemResponse, len(items))
		for i, item := range items {
			response[i] = toItemResponse(item)
		}
		httputil.RespondWithJSON(c.Writer, c.Request, map[string]interface{}{"items": response}, http.StatusOK)
	}
}

func PostItem(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := session.Get(s.SessionManager, c.Request.Context())
		item := validate.GetRequestBody(c).(*ItemRequest)

		savedItem, err := s.Store.SaveItem(c.Request.Context(), sess.ID, item.Text)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
			return
		}

		response := toItemResponse(savedItem)
		httputil.RespondWithJSON(c.Writer, c.Request, response, http.StatusCreated)
	}
}

func toItemResponse(savedItem store.Item) ItemResponse {
	return ItemResponse{
		ID:            savedItem.ID.Hex(),
		Text:          savedItem.Text,
		DateCreated:   savedItem.DateCreated,
		DateCompleted: savedItem.DateCompleted,
	}
}
