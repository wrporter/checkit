package auth

import (
	"encoding/gob"
	"github.com/alexedwards/scs/v2"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/wrporter/games-app/server/internal/server"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/limit"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"github.com/wrporter/games-app/server/internal/server/validate"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
)

type (
	SignupRequest struct {
		Image       string `json:"image" validate:"max=5000"`
		DisplayName string `json:"displayName" validate:"required,max=30"`
		Email       string `json:"email" validate:"required,email,max=50"`
		Password    string `json:"password" validate:"max=64"`
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
		Password string `json:"password" validate:"max=64"`
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

func init() {
	gob.Register(UserResponse{})
}

// TODO switch from Implicit Grant Flow to Authorization Code Flow
func RegisterRoutes(server *server.Server) {
	group := server.Router.Group("/api/auth").Use(limit.WithRateLimit())
	{
		group.GET("/oauth/google", GoogleCallback(server.Store, server.SessionManager.Manager))
		group.GET("/oauth/google/:method", HandleGoogleLogin)

		//group.POST("/oauth/google/login",
		//	validate.RequestBody(OAuthLoginRequest{}),
		//	GoogleLogin(server.Store, server.SessionManager.Manager),
		//)
		//group.POST("/oauth/google/signup",
		//	validate.RequestBody(OAuthSignupRequest{}),
		//	GoogleSignup(server.Store, server.SessionManager.Manager),
		//)

		group.POST("/login",
			validate.RequestBody(LoginRequest{}),
			Login(server.Store, server.SessionManager.Manager),
		)

		group.POST("/signup",
			validate.RequestBody(SignupRequest{}),
			Signup(server.Store, server.SessionManager.Manager),
		)

		group.POST("/logout",
			RequireAuth(server.SessionManager.Manager),
			Logout(server.SessionManager),
		)

		group.GET("/user", GetUser(server.SessionManager))
	}

	server.Router.GET("/api/keepalive", Keepalive(server.SessionManager))
}

func Keepalive(sessionManager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := session.Get(sessionManager, c.Request.Context())

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("[error] failed to upgrade route to websocket protocol", err.Error())
			return
		}
		defer conn.Close()

		cookie, err := c.Request.Cookie(session.CookieName)
		if err != nil {
			log.Print("Failed to get session token cookie", err.Error())
			return
		}
		client := &session.Client{
			Token:  cookie.Value,
			Delete: make(chan bool),
		}
		sessionManager.Hub.Register <- client

		select {
		case <-client.Delete:
			err = conn.WriteMessage(websocket.TextMessage, []byte("session_end"))
			log.Printf("Session expired for user %s", sess.ID.Hex())
			sessionManager.Hub.Unregister <- cookie.Value
			if err != nil {
				log.Printf("Failed to send session end message: %v", err)
			}
		}
	}
}

func Logout(manager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess := session.Get(manager, c.Request.Context())
		err := manager.Manager.Destroy(c.Request.Context())
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, err)
			return
		}
		log.Printf("User logged out - %s\n", sess.ID.Hex())
		c.Writer.WriteHeader(http.StatusOK)
	}
}

func GetUser(sessionManager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !session.Exists(sessionManager, c.Request.Context()) {
			c.Writer.WriteHeader(http.StatusNoContent)
			return
		}

		user := session.Get(sessionManager, c.Request.Context())
		httputil.RespondWithJSON(c.Writer, c.Request, user, 200)
	}
}

func Signup(s store.Store, sessionManager *scs.SessionManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		body := validate.GetRequestBody(c).(*SignupRequest)

		u, err := s.GetUserByEmail(c.Request.Context(), body.Email)
		if u != nil {
			log.Printf("Failed signup for user that already exists: %s\n", u.ID.Hex())
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPBadRequest("Bad request"))
			return
		} else if err != nil && err != mongo.ErrNoDocuments {
			log.Printf("Failed to get user from database: %s\n", err.Error())
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError("Internal server error"))
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), 14)
		if err != nil {
			log.Printf("Failed to hash password: %s\n", err.Error())
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError("Internal server error"))
			return
		}
		u, err = s.SaveUser(c.Request.Context(), store.User{
			Image:           body.Image,
			Email:           body.Email,
			DisplayName:     body.DisplayName,
			Password:        string(hashedPassword),
			SocialProviders: map[string]bool{"basic": true},
		})
		if err != nil {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
			return
		}

		log.Printf("User signed up - %s\n", u.ID.Hex())
		sessionManager.Put(c.Request.Context(), session.ContextKey, u)
		c.Status(http.StatusNoContent)
	}
}

func Login(store store.Store, sessionManager *scs.SessionManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		body := validate.GetRequestBody(c).(*LoginRequest)

		u, err := store.GetUserByEmail(c.Request.Context(), body.Email)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusUnauthorized, httputil.ToHTTPError(http.StatusUnauthorized, "Invalid username or password"))
			return
		} else if err != nil {
			log.Printf("Failed to get user from database: %s\n", err.Error())
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError("Failed to login"))
			return
		}

		if !u.SocialProviders["basic"] {
			c.JSON(http.StatusUnauthorized, httputil.ToHTTPError(http.StatusUnauthorized, "TODO: Allow linking social accounts"))
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(body.Password))
		if err != nil {
			if err != bcrypt.ErrMismatchedHashAndPassword {
				log.Printf("Failed to compare hash and password on login: %s\n", err.Error())
			}
			c.JSON(http.StatusUnauthorized, httputil.ToHTTPError(http.StatusUnauthorized, "Invalid username or password"))
			return
		}

		log.Printf("User logged in - %s\n", u.ID.Hex())
		sessionManager.Put(c.Request.Context(), session.ContextKey, u)
		c.JSON(http.StatusOK, u)
	}
}

func RequireAuth(sessionManager *scs.SessionManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sessionManager.Exists(c.Request.Context(), session.ContextKey) {
			httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPUnauthorized("401 Unauthorized"))
			c.Abort()
		}
	}
}
