package auth

import (
	"github.com/alexedwards/scs/v2"
	"github.com/julienschmidt/httprouter"
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"net/http"
)

var (
	// TODO: Use for Authorization Code Flow
	clientID     = env.RequireEnv("GOOGLE_OAUTH_CLIENT_ID")
	clientSecret = env.RequireEnv("GOOGLE_OAUTH_CLIENT_SECRET")
)

// TODO switch from Implicit Grant Flow to Authorization Code Flow
func RegisterRoutes(server *server.Server) {
	server.Router.POST("/api/google/login", httputil.Adapt(
		Login(server.Store, server.SessionManager),
		httputil.ValidateRequestJSON(session.OAuthSession{}),
	))
	server.Router.POST("/api/logout", httputil.Adapt(
		Logout(server.SessionManager),
		WithAuth(server.SessionManager)))
	server.Router.GET("/api/user", httputil.Adapt(
		GetUser(server.SessionManager),
		WithAuth(server.SessionManager)))
}

func Logout(manager *scs.SessionManager) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		sess := session.Get(manager, request.Context())
		err := manager.Destroy(request.Context())
		if err != nil {
			httputil.RespondWithError(writer, request, err)
			return
		}
		log.Printf("User logged out - %s\n", sess.User.ID.Hex())
		writer.WriteHeader(http.StatusOK)
	}
}

func GetUser(sessionManager *scs.SessionManager) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		sess := session.Get(sessionManager, request.Context())
		httputil.RespondWithJSON(writer, request, sess.User, 200)
	}
}

func Login(store store.Store, sessionManager *scs.SessionManager) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		body := httputil.GetRequestBody(req).(*session.OAuthSession)

		u, err := store.GetUserByEmail(body.User.Email)
		var id string
		if err == mongo.ErrNoDocuments {
			oid, err := store.SaveUser(body.User)
			if err != nil {
				httputil.RespondWithError(res, req, httputil.ErrHTTPInternalServerError(err.Error()))
				return
			}
			body.User.ID = oid
			id = oid.Hex()
			log.Printf("User registered - %s\n", id)
		} else {
			id = u.ID.Hex()
			body.User.ID = u.ID
		}

		sessionManager.Put(req.Context(), session.ContextKey, body)
		log.Printf("User logged in - %s\n", id)
		httputil.RespondWithJSON(res, req, body.User, 200)
	}
}

func WithAuth(sessionManager *scs.SessionManager) httputil.Adapter {
	return func(handle httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			if auth := sessionManager.Get(request.Context(), session.ContextKey); auth == nil {
				httputil.RespondWithError(writer, request, httputil.ErrHTTPUnauthorized("401 Unauthorized"))
			} else {
				handle(writer, request, params)
			}
		}
	}
}
