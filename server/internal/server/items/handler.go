package items

import (
	"fmt"
	"github.com/gin-gonic/gin"
	timeout "github.com/vearne/gin-timeout"
	"github.com/wrporter/checkit/server/internal/lib/gin/auth/oauth"
	"github.com/wrporter/checkit/server/internal/lib/httputil"
	"github.com/wrporter/checkit/server/internal/lib/rate"
	"github.com/wrporter/checkit/server/internal/lib/validate"
	"github.com/wrporter/checkit/server/internal/server"
	"github.com/wrporter/checkit/server/internal/server/store"
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
	group := s.Router.Group("/api").
		Use(rate.Limit()).
		Use(timeout.Timeout(
			timeout.WithTimeout(10*time.Second),
			timeout.WithErrorHttpCode(http.StatusRequestTimeout),
			timeout.WithDefaultMsg(`{"status":408,"message":"Request Timeout"}`),
		))

	{
		group.GET("/items",
			oauth.RequireAuth(s.SessionManager),
			GetItems(s),
		)
		group.POST("/items",
			oauth.RequireAuth(s.SessionManager),
			validate.RequestBody(ItemRequest{}),
			PostItem(s),
		)
		group.DELETE("/items",
			oauth.RequireAuth(s.SessionManager),
			DeleteItems(s),
		)
		group.DELETE("/items/completed",
			oauth.RequireAuth(s.SessionManager),
			DeleteCompletedItems(s),
		)
		group.POST(fmt.Sprintf("/items/:%s", ParamItemID),
			oauth.RequireAuth(s.SessionManager),
			validate.RequestBody(ItemUpdateStatusRequest{}),
			UpdateItemStatus(s),
		)
	}
}

func DeleteItems(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := s.SessionManager.Get(c.Request.Context())
		err := s.Store.DeleteItems(c.Request.Context(), user.ID)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
		}
		c.Writer.WriteHeader(http.StatusNoContent)
	}
}

func DeleteCompletedItems(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := s.SessionManager.Get(c.Request.Context())
		err := s.Store.DeleteCompletedItems(c.Request.Context(), user.ID)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
		}
		c.Writer.WriteHeader(http.StatusNoContent)
	}
}

func UpdateItemStatus(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := s.SessionManager.Get(c.Request.Context())
		body := validate.GetRequestBody(c).(*ItemUpdateStatusRequest)

		itemID := c.Params.ByName(ParamItemID)
		err := s.Store.UpdateItemStatus(c.Request.Context(), user.ID, itemID, body.Status)
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
		}
		c.Writer.WriteHeader(http.StatusNoContent)
	}
}

func GetItems(s *server.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := s.SessionManager.Get(c.Request.Context())

		items, err := s.Store.GetItemsForUser(c.Request.Context(), user.ID)
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
		user := s.SessionManager.Get(c.Request.Context())
		item := validate.GetRequestBody(c).(*ItemRequest)

		savedItem, err := s.Store.SaveItem(c.Request.Context(), user.ID, item.Text)
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
