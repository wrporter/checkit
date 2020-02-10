package items

import (
	"fmt"
	"github.com/julienschmidt/httprouter"
	"github.com/wrporter/games-app/server/internal/server"
	"github.com/wrporter/games-app/server/internal/server/auth"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
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
	s.Router.GET("/api/items", httputil.Adapt(
		GetItems(s),
		auth.WithAuth(s.SessionManager.Manager),
	))
	s.Router.POST("/api/items", httputil.Adapt(
		PostItem(s),
		auth.WithAuth(s.SessionManager.Manager),
		httputil.ValidateRequestJSON(ItemRequest{}),
	))
	s.Router.POST(fmt.Sprintf("/api/items/:%s", ParamItemID), httputil.Adapt(
		UpdateItemStatus(s),
		auth.WithAuth(s.SessionManager.Manager),
		httputil.ValidateRequestJSON(ItemUpdateStatusRequest{}),
	))
}

func UpdateItemStatus(s *server.Server) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		sess := session.Get(s.SessionManager, request.Context())
		body := httputil.GetRequestBody(request).(*ItemUpdateStatusRequest)

		itemID := params.ByName(ParamItemID)
		err := s.Store.UpdateItemStatus(sess.User.ID, itemID, body.Status)
		if err != nil {
			httputil.RespondWithError(writer, request, httputil.ErrHTTPInternalServerError(err.Error()))
		}
		writer.WriteHeader(http.StatusNoContent)
	}
}

func GetItems(s *server.Server) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		sess := session.Get(s.SessionManager, request.Context())

		items, err := s.Store.GetItemsForUser(sess.User.ID)
		if err != nil {
			httputil.RespondWithError(writer, request, httputil.ErrHTTPInternalServerError(err.Error()))
			return
		}

		response := make([]ItemResponse, len(items))
		for i, item := range items {
			response[i] = toItemResponse(item)
		}
		httputil.RespondWithJSON(writer, request, map[string]interface{}{"items": response}, http.StatusOK)
	}
}

func PostItem(s *server.Server) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		sess := session.Get(s.SessionManager, request.Context())
		item := httputil.GetRequestBody(request).(*ItemRequest)

		savedItem, err := s.Store.SaveItem(sess.User.ID, item.Text)
		if err != nil {
			httputil.RespondWithError(writer, request, httputil.ErrHTTPInternalServerError(err.Error()))
			return
		}

		response := toItemResponse(savedItem)
		httputil.RespondWithJSON(writer, request, response, http.StatusCreated)
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
