package session

import (
	"context"
	"encoding/gob"
	"github.com/alexedwards/scs/v2"
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server/store"
	"net/http"
	"time"
)

const SessionCookieName = "acct"
const ContextKey = "session.context"

type (
	OAuthSession struct {
		TokenID     string     `json:"tokenId"`
		AccessToken string     `json:"accessToken"`
		User        store.User `json:"profileObj"`
	}
)

func SetupSessionManager() *scs.SessionManager {
	gob.Register(OAuthSession{})

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

func Get(sessionManager *scs.SessionManager, ctx context.Context) OAuthSession {
	return sessionManager.Get(ctx, ContextKey).(OAuthSession)
}
