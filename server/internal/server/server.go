package server

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/wrporter/checkit/server/internal/lib/app"
	"github.com/wrporter/checkit/server/internal/lib/gin/ginzap"
	"github.com/wrporter/checkit/server/internal/lib/session"
	"github.com/wrporter/checkit/server/internal/lib/validate"
	"github.com/wrporter/checkit/server/internal/server/store"
	"net/http"
)

type (
	// Server implements http.Handler
	Server struct {
		Router         *gin.Engine
		SessionManager *session.Manager
		Store          store.Store
	}
)

func New() *Server {
	sessionManager := session.NewManager()

	router := gin.New()
	router.Use(ginzap.Access())
	router.Use(ginzap.Recover())
	router.Use(ginzap.Transaction())

	// TODO: Add timeouts to routes so we don't hang up threads.
	//router.Use(timeout.Timeout(
	//	timeout.WithTimeout(10*time.Second),
	//	timeout.WithErrorHttpCode(http.StatusRequestTimeout),
	//	timeout.WithDefaultMsg(`{"status":408,"message":"Request Timeout"}`),
	//))

	validator := &validate.DefaultGinValidator{}
	validator.RegisterValidator("itemStatus", store.ValidateItemStatus, "{0} must be a valid status")
	binding.Validator = validator

	server := &Server{
		Router:         router,
		SessionManager: sessionManager,
		Store:          store.New(),
	}

	router.GET("/api/version", gin.WrapF(app.VersionHandlerFunc))
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return server
}

func (server *Server) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	server.Router.ServeHTTP(writer, request)
}
