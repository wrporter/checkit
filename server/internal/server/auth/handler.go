package auth

import (
	"encoding/gob"
	"errors"
	"github.com/alexedwards/scs/v2"
	"github.com/julienschmidt/httprouter"
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"net/http"
	"reflect"
	"time"
)

var (
	clientID     = env.RequireEnv("GOOGLE_OAUTH_CLIENT_ID")
	clientSecret = env.RequireEnv("GOOGLE_OAUTH_CLIENT_SECRET")
)

const SessionCookieName = "acct"

func SetupSessionManager() *scs.SessionManager {
	sessionManager := scs.New()
	sessionManager.Lifetime = 1 * time.Hour
	sessionManager.IdleTimeout = 20 * time.Minute
	sessionManager.Cookie.Name = SessionCookieName
	//sessionManager.Cookie.Domain = "example.com"
	//sessionManager.Cookie.Path = "/example/"
	sessionManager.Cookie.Persist = true
	//sessionManager.Cookie.SameSite = http.SameSiteStrictMode
	//sessionManager.Cookie.Secure = true
	return sessionManager
}

type (
	OAuthProfile struct {
		ImageURL   string `json:"imageUrl"`
		Email      string `json:"email"`
		Name       string `json:"name"`
		GivenName  string `json:"givenName"`
		FamilyName string `json:"familyName"`
	}

	OAuthTokenRequestBody struct {
		TokenID     string       `json:"tokenId"`
		AccessToken string       `json:"accessToken"`
		Profile     OAuthProfile `json:"profileObj"`
	}
)

func RegisterRoutes(router *httprouter.Router, sessionManager *scs.SessionManager) {
	router.POST("/api/google/login", httputil.Adapt(
		PostLogin(sessionManager),
		httputil.ValidateRequestJSON(reflect.TypeOf(OAuthTokenRequestBody{})),
	))
	router.GET("/api/user", GetUser(sessionManager))
}

func GetUser(sessionManager *scs.SessionManager) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		if auth := sessionManager.Get(request.Context(), ContextKey); auth != nil {
			user := auth.(OAuthTokenRequestBody).Profile
			httputil.RespondWithJSON(writer, request, user, 200)
		} else {
			httputil.RespondWithJSON(writer, request, struct {
				Fail string
			}{Fail: "Unauthorized"}, 403)
		}
	}
}

func PostLogin(sessionManager *scs.SessionManager) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		body, ok := req.Context().Value(httputil.RequestBodyKey).(*OAuthTokenRequestBody)
		if !ok {
			httputil.RespondWithError(res, req, errors.New("unable to find request body"))
			return
		}

		gob.Register(OAuthTokenRequestBody{})
		sessionManager.Put(req.Context(), ContextKey, body)
		httputil.RespondWithJSON(res, req, body.Profile, 200)
	}
}
