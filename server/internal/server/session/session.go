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

const CookieName = "SessionID"
const ContextKey = "session.context"

type Manager struct {
	Hub     *hub
	Manager *scs.SessionManager
}

func init() {
	gob.Register(store.User{})
}

func NewManager() *Manager {
	sessionManager := scs.New()
	sessionManager.Lifetime = 24 * time.Hour
	sessionManager.IdleTimeout = 2 * time.Hour
	sessionManager.Cookie.Name = CookieName
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
	//sessionManager.MemoryStore = redisstore.New(pool)

	hub := newHub()
	go hub.run()
	sessionManager.Store = newStore(hub)

	return &Manager{
		Hub:     hub,
		Manager: sessionManager,
	}
}

func Get(sessionManager *Manager, ctx context.Context) store.User {
	if sess, ok := sessionManager.Manager.Get(ctx, ContextKey).(store.User); ok {
		return sess
	}
	return store.User{}
}

func Exists(sessionManager *Manager, ctx context.Context) bool {
	if _, ok := sessionManager.Manager.Get(ctx, ContextKey).(store.User); ok {
		return true
	}
	return false
}
