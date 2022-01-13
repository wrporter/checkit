package oauth

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/wrporter/checkit/server/internal/lib/gin/ginzap"
	"github.com/wrporter/checkit/server/internal/lib/httputil"
	"github.com/wrporter/checkit/server/internal/lib/limit"
	"github.com/wrporter/checkit/server/internal/lib/log"
	"github.com/wrporter/checkit/server/internal/lib/session"
	"github.com/wrporter/checkit/server/internal/lib/validate"
	"github.com/wrporter/checkit/server/internal/server"
	"github.com/wrporter/checkit/server/internal/server/store"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"time"
)

type (
	SignupRequest struct {
		Image       string `json:"image" validate:"max=5000"`
		DisplayName string `json:"displayName" validate:"required,max=30"`
		Email       string `json:"email" validate:"required,email,max=50"`
		Password    string `json:"password" validate:"required,max=64"`
	}

	OAuthLoginRequest struct {
		Email    string `json:"email" validate:"required,email,max=50"`
		Provider string `json:"provider" validate:"required,max=50"`
	}

	OAuthSignupRequest struct {
		ImageURL    string `json:"imageUrl" validate:"max=5000"`
		DisplayName string `json:"displayName" validate:"required,max=30"`
		Email       string `json:"email" validate:"required,email,max=50"`
		Provider    string `json:"provider" validate:"required,max=50"`
	}

	LoginRequest struct {
		Email    string `json:"email" validate:"required,email,max=50"`
		Password string `json:"password" validate:"required,max=64"`
	}

	UserResponse struct {
		Image       string `json:"image"`
		DisplayName string `json:"displayName"`
		Email       string `json:"email"`
	}
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

//func init() {
//	gob.Register(UserResponse{})
//}

// TODO switch from Implicit Grant Flow to Authorization Code Flow
func RegisterRoutes(server *server.Server) {
	group := server.Router.Group("/api/auth").Use(limit.WithRateLimit())
	{
		group.GET("/oauth/google", GoogleCallback(server.Store, server.SessionManager))
		group.GET("/oauth/google/:method", HandleGoogleLogin)

		group.POST("/login",
			validate.RequestBody(LoginRequest{}),
			Login(server.Store, server.SessionManager),
		)

		group.POST("/signup",
			validate.RequestBody(SignupRequest{}),
			Signup(server.Store, server.SessionManager),
		)

		group.POST("/logout",
			RequireAuth(server.SessionManager),
			Logout(server.SessionManager),
		)

		group.GET("/user", GetUser(server.Store, server.SessionManager))
		group.DELETE("/user",
			RequireAuth(server.SessionManager),
			DeleteUser(server.Store, server.SessionManager),
		)
	}

	server.Router.GET("/api/keepalive", Keepalive(server.SessionManager))
}

func Keepalive(manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := manager.Get(c.Request.Context())

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.SC(c.Request.Context()).Error("[error] failed to upgrade route to websocket protocol", err)
			return
		}
		defer conn.Close()
		_ = conn.WriteMessage(websocket.TextMessage, []byte("connected"))

		cookie, err := c.Request.Cookie(session.CookieName)
		if err != nil {
			log.SC(c.Request.Context()).Error("Failed to get session token cookie", err)
			return
		}
		client := &session.Client{
			Token:  cookie.Value,
			Delete: make(chan bool),
		}
		manager.Hub.Register <- client

		select {
		case <-client.Delete:
			err = conn.WriteMessage(websocket.TextMessage, []byte("session_end"))
			log.SC(c.Request.Context()).Infof("Session expired for user %s", sess.ID)
			manager.Hub.Unregister <- cookie.Value
			if err != nil {
				log.SC(c.Request.Context()).Errorf("Failed to send session end message: %v", err)
			}
		}
	}
}

func Logout(manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := manager.Get(c.Request.Context())
		err := manager.Destroy(c.Request.Context())
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to logout: %v", err)
			httputil.InternalError(c, "Failed to logout")
			return
		}
		log.SC(c.Request.Context()).Infof("User logged out - %s", sess.ID)
		c.Writer.WriteHeader(http.StatusOK)
	}
}

func GetUser(s store.Store, manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !manager.Exists(c.Request.Context()) {
			c.Status(http.StatusNoContent)
			return
		}

		user := manager.Get(c.Request.Context())
		u, err := s.GetUser(c.Request.Context(), user.ID)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to get user: %v", err)
			httputil.InternalError(c, "Failed to get user")
			return
		}

		c.JSON(http.StatusOK, UserResponse{
			Image:       u.ImageURL,
			DisplayName: u.DisplayName,
			Email:       u.Email,
		})
	}
}

func DeleteUser(s store.Store, manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := manager.Get(c.Request.Context())

		err := s.DeleteUser(c.Request.Context(), user.ID)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to delete all user data: %v", err)
			httputil.InternalError(c, "Failed to delete all user data")
			return
		}

		err = manager.Destroy(c.Request.Context())
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to destroy session: %v", err)
			httputil.InternalError(c, "Failed to destroy session")
			return
		}

		c.Status(http.StatusNoContent)
	}
}

func Signup(s store.Store, manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		body := validate.GetRequestBody(c).(*SignupRequest)

		timer := Track(c.Request.Context(), time.Now(), "Mongo: Get user by email")
		u, err := s.GetUserByEmail(c.Request.Context(), body.Email)
		timer()
		if u != nil {
			log.SC(c.Request.Context()).Errorf("Failed signup for user that already exists: %s", u.ID.Hex())
			httputil.Error(c, http.StatusBadRequest, "Bad request")
			return
		} else if err != nil && err != mongo.ErrNoDocuments {
			log.SC(c.Request.Context()).Errorf("Failed to get user from database: %s", err)
			httputil.InternalError(c, "Internal server error")
			return
		}

		timer = Track(c.Request.Context(), time.Now(), "Mongo: Hash password")
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
		timer()
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to hash password: %s", err)
			httputil.InternalError(c, "Internal server error")
			return
		}
		timer = Track(c.Request.Context(), time.Now(), "Mongo: Save user")
		u, err = s.SaveUser(c.Request.Context(), store.User{
			Image:           body.Image,
			Email:           body.Email,
			DisplayName:     body.DisplayName,
			Password:        string(hashedPassword),
			SocialProviders: map[string]bool{"basic": true},
		})
		timer()
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to save user: %s", err)
			httputil.InternalError(c, "Internal server error")
			return
		}

		timer = Track(c.Request.Context(), time.Now(), "Mongo: Add to session")
		log.SC(c.Request.Context()).Infof("User signed up: %s", u.ID.Hex())
		manager.Put(c.Request.Context(), session.User{ID: u.ID.Hex()})
		ginzap.AddUserID(c, u.ID.Hex())
		timer()
		c.Status(http.StatusNoContent)
	}
}

func Login(store store.Store, manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		body := validate.GetRequestBody(c).(*LoginRequest)

		u, err := store.GetUserByEmail(c.Request.Context(), body.Email)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusUnauthorized, httputil.ToHTTPError(http.StatusUnauthorized, "Invalid username or password"))
			return
		} else if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to get user from database: %s", err)
			httputil.Error(c, http.StatusInternalServerError, "Failed to login")
			return
		}

		if !u.SocialProviders["basic"] {
			httputil.Error(c, http.StatusUnauthorized, "TODO: Allow linking social accounts")
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(body.Password))
		if err != nil {
			if err != bcrypt.ErrMismatchedHashAndPassword {
				log.SC(c.Request.Context()).Errorf("Failed to compare hash and password on login: %s", err)
			}
			httputil.Error(c, http.StatusUnauthorized, "Invalid username or password")
			return
		}

		log.SC(c.Request.Context()).Infof("User logged in: %s", u.ID.Hex())
		manager.Put(c.Request.Context(), session.User{ID: u.ID.Hex()})
		ginzap.AddUserID(c, u.ID.Hex())
		c.JSON(http.StatusOK, u)
	}
}

func RequireAuth(manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !manager.Exists(c.Request.Context()) {
			httputil.Error(c, http.StatusUnauthorized, "Session expired")
			c.Abort()
		}
	}
}
func Track(ctx context.Context, start time.Time, component string) func() {
	return func() {
		elapsed := time.Since(start)
		log.SC(ctx).Infof("🕒 %s took %s", component, elapsed)
	}
}
