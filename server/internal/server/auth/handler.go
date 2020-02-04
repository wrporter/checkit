package auth

import (
	"encoding/gob"
	"github.com/alexedwards/scs/v2"
	"github.com/julienschmidt/httprouter"
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"net/http"
	"reflect"
	"time"
)

var (
	// TODO: Use for Authorization Code Flow
	clientID     = env.RequireEnv("GOOGLE_OAUTH_CLIENT_ID")
	clientSecret = env.RequireEnv("GOOGLE_OAUTH_CLIENT_SECRET")
)

const SessionCookieName = "acct"

func SetupSessionManager() *scs.SessionManager {
	sessionManager := scs.New()
	sessionManager.Lifetime = 1 * time.Hour
	sessionManager.IdleTimeout = 30 * time.Minute
	sessionManager.Cookie.Name = SessionCookieName
	sessionManager.Cookie.Domain = env.SiteHost
	sessionManager.Cookie.Path = "/"
	sessionManager.Cookie.Persist = true
	sessionManager.Cookie.SameSite = http.SameSiteStrictMode
	sessionManager.Cookie.Secure = true

	// TODO: Persist sessions across server restarts
	//pool := &redis.Pool{
	//	MaxIdle: 10,
	//	Dial: func() (redis.Conn, error) {
	//		return redis.Dial("tcp", "localhost:6379")
	//	},
	//}
	//sessionManager.Store = redisstore.New(pool)

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

// TODO create authentication adapter for all auth routes
// TODO switch from Implicit Grant Flow to Authorization Code Flow
// TODO implement CSRF protection (how to do for Single-Page App?)
func RegisterRoutes(router *httprouter.Router, sessionManager *scs.SessionManager) {
	gob.Register(OAuthTokenRequestBody{})

	router.POST("/api/google/login", httputil.Adapt(
		PostLogin(sessionManager),
		httputil.ValidateRequestJSON(reflect.TypeOf(OAuthTokenRequestBody{})),
	))
	router.POST("/api/logout", httputil.Adapt(
		Logout(sessionManager),
		WithAuth(sessionManager)))
	router.GET("/api/user", httputil.Adapt(
		GetUser(sessionManager),
		WithAuth(sessionManager)))
}

func Logout(manager *scs.SessionManager) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		err := manager.Destroy(request.Context())
		if err != nil {
			httputil.RespondWithError(writer, request, err)
			return
		}
		writer.WriteHeader(http.StatusOK)
	}
}

func GetUser(sessionManager *scs.SessionManager) httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		auth := sessionManager.Get(request.Context(), ContextKey)
		user := auth.(OAuthTokenRequestBody).Profile
		httputil.RespondWithJSON(writer, request, user, 200)
	}
}

func PostLogin(sessionManager *scs.SessionManager) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		body := req.Context().Value(httputil.RequestBodyKey).(*OAuthTokenRequestBody)
		sessionManager.Put(req.Context(), ContextKey, body)
		httputil.RespondWithJSON(res, req, body.Profile, 200)
	}
}

func WithAuth(sessionManager *scs.SessionManager) httputil.Adapter {
	return func(handle httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			if auth := sessionManager.Get(request.Context(), ContextKey); auth == nil {
				httputil.RespondWithError(writer, request, httputil.ErrHTTPUnauthorized("401 Unauthorized"))
			} else {
				handle(writer, request, params)
			}
		}
	}
}
