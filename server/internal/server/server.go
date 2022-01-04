package server

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"github.com/wrporter/games-app/server/internal/server/validate"
	"net"
	"net/http"
	"time"
)

const (
	requestTimeout = 30 * time.Second
)

type (
	// Server implements http.Handler
	Server struct {
		Router         *gin.Engine
		SessionManager *session.Manager
		Store          store.Store
	}

	responseRecorder struct {
		http.ResponseWriter
		status int
		length int
	}
)

func (w *responseRecorder) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *responseRecorder) Write(b []byte) (int, error) {
	if w.status == 0 {
		w.status = 200
	}
	n, err := w.ResponseWriter.Write(b)
	w.length += n
	return n, err
}

func (w *responseRecorder) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	if hj, ok := w.ResponseWriter.(http.Hijacker); ok {
		return hj.Hijack()
	}
	return nil, nil, errors.New("error in hijacker")
}

func New() *Server {
	sessionManager := session.NewManager()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(accessLogMiddleware(sessionManager))

	validator := &validate.DefaultGinValidator{}
	validator.RegisterValidator("itemStatus", store.ValidateItemStatus, "{0} must be a valid status")
	binding.Validator = validator

	server := &Server{
		Router:         router,
		SessionManager: sessionManager,
		Store:          store.New(),
	}

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return server
}

func (server *Server) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	//start := time.Now()
	//ctx, cancel := context.WithTimeout(request.Context(), requestTimeout)
	//defer cancel()
	//
	//// TODO apply context data such as request transaction identifiers
	//request = request.WithContext(ctx)
	//
	sw := responseRecorder{ResponseWriter: writer}
	server.Router.ServeHTTP(&sw, request)

	//defer server.logAccess(sw, request, start)
}

func accessLogMiddleware(sessionManager *session.Manager) gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		access := map[string]interface{}{
			"host":      param.Request.Host,
			"clientIP":  param.ClientIP,
			"userAgent": param.Request.UserAgent(),
			"url":       param.Path,
			"bytesIn":   param.Request.ContentLength,
			"method":    param.Method,
			"bytes":     param.BodySize,
			"status":    param.StatusCode,
			"time":      param.Latency.Milliseconds(),
		}
		if session.Exists(sessionManager, param.Request.Context()) {
			access["userId"] = session.Get(sessionManager, param.Request.Context()).ID.Hex()
		}

		accessJsonString, err := json.Marshal(access)
		if err != nil {
			return fmt.Sprintf("Failed to marshal access logs %v\n", err.Error())
		}
		return fmt.Sprintf("%s [access] %s\n", param.TimeStamp.Format("2006-01-02T15:04:05.999Z"), accessJsonString)
	})
}
