package session

import (
	"context"
	"encoding/gob"
	"github.com/alexedwards/scs/v2"
	"github.com/wrporter/checkit/server/internal/lib/env"
	"time"
)

const CookieName = "SessionID"
const ContextKey = "session.context"

type Manager struct {
	*scs.SessionManager
	Hub *hub
}

type User struct {
	ID string `json:"id"`
}

func init() {
	gob.Register(User{})
}

func NewManager() *Manager {
	sessionManager := scs.New()
	sessionManager.Lifetime = 24 * time.Hour
	sessionManager.IdleTimeout = 2 * time.Hour
	sessionManager.Cookie.Name = CookieName
	sessionManager.Cookie.Domain = env.SiteHost
	sessionManager.Cookie.Path = "/"
	sessionManager.Cookie.Persist = true
	//sessionManager.Cookie.SameSite = http.SameSiteStrictMode
	//sessionManager.Cookie.Secure = true
	//sessionManager.Cookie.HttpOnly = true

	// TODO: Persist sessions across server restarts
	//pool := &redis.Pool{
	//	MaxIdle: 10,
	//	Dial: func() (redis.Conn, error) {
	//		return redis.Dial("tcp", "localhost:6379")
	//	},
	//}
	//sessionManager.MemoryStore = redisstore.New(pool)

	h := newHub()
	go h.run()
	sessionManager.Store = newStore(h)

	return &Manager{
		SessionManager: sessionManager,
		Hub:            h,
	}
}

func (m *Manager) Put(ctx context.Context, user User) {
	m.SessionManager.Put(ctx, ContextKey, user)
}

func (m *Manager) Get(ctx context.Context) User {
	if sess, ok := m.SessionManager.Get(ctx, ContextKey).(User); ok {
		return sess
	}
	return User{}
}

func (m *Manager) Exists(ctx context.Context) bool {
	if _, ok := m.SessionManager.Get(ctx, ContextKey).(User); ok {
		return true
	}
	return false
}
