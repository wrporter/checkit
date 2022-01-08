package server

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/wrporter/checkit/server/internal/server/session"
	"github.com/wrporter/checkit/server/internal/server/store"
	"github.com/wrporter/checkit/server/internal/server/validate"
	"github.com/wrporter/checkit/server/internal/transaction"
	"go.uber.org/zap"
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
	router.Use(accessLog(sessionManager))
	router.Use(ginzap.RecoveryWithZap(zap.L(), true))

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
	sw := responseRecorder{ResponseWriter: writer}
	server.Router.ServeHTTP(&sw, request)
}

func accessLog(sessionManager *session.Manager) gin.HandlerFunc {
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

		if t, ok := transaction.FromContext(param.Request.Context()); ok {
			access["transactionId"] = t.TransactionID
			access["requestId"] = t.RequestID
			if t.ParentRequestID != "" {
				access["parentRequestId"] = t.ParentRequestID
			}
		}

		accessJsonString, err := json.Marshal(access)
		if err != nil {
			return fmt.Sprintf("Failed to marshal access logs %v\n", err.Error())
		}
		return fmt.Sprintf("%s [access] %s\n", param.TimeStamp.Format(time.RFC3339), accessJsonString)
	})
}
