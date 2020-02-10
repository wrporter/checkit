package server

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"log"
	"net"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/julienschmidt/httprouter"
)

const (
	requestTimeout = 180 * time.Second
)

type (
	// Server implements http.Handler
	Server struct {
		Router         *httprouter.Router
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
	server := &Server{
		Router:         setupRouter(),
		SessionManager: session.NewManager(),
		Store:          store.New(),
	}

	server.Router.GET("/api/health", func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		httputil.RespondWithJSON(writer, request, map[string]string{"status": "ok"}, http.StatusOK)
	})

	return server
}

func setupRouter() *httprouter.Router {
	router := httprouter.New()
	router.PanicHandler = panicHandler
	router.NotFound = http.HandlerFunc(notFoundHandler)
	router.MethodNotAllowed = http.HandlerFunc(methodNotAllowedHandler)
	return router
}

func (server *Server) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	start := time.Now()
	ctx, cancel := context.WithTimeout(request.Context(), requestTimeout)
	defer cancel()

	// TODO apply context data such as request transaction identifiers
	request = request.WithContext(ctx)

	sw := responseRecorder{ResponseWriter: writer}
	server.Router.ServeHTTP(&sw, request)

	defer server.logAccess(sw, request, start)
}

func (server *Server) logAccess(sw responseRecorder, request *http.Request, start time.Time) {
	sess := session.Get(server.SessionManager, request.Context())

	access := map[string]interface{}{
		"host":      request.Host,
		"clientIP":  getIp(request),
		"userAgent": request.UserAgent(),
		"url":       request.URL.Path,
		"bytesIn":   request.ContentLength,
		"method":    request.Method,
		"bytes":     sw.length,
		"status":    sw.status,
		"time":      time.Since(start).Milliseconds(),
	}
	if sess.AccessToken != "" {
		access["userId"] = sess.User.ID.Hex()
	}

	accessJsonString, err := json.Marshal(access)
	if err != nil {
		log.Printf("Failed to marshal access logs %v\n", err.Error())
	} else {
		log.Printf("[access] %s", accessJsonString)
	}
}

func getIp(r *http.Request) string {
	forwarded := r.Header.Get("X-FORWARDED-FOR")
	if forwarded != "" {
		return forwarded
	}
	return r.RemoteAddr
}

func panicHandler(writer http.ResponseWriter, request *http.Request, data interface{}) {
	log.Printf("Internal server error: %s\n%s", data, debug.Stack())
	httputil.RespondWithError(writer, request, httputil.ErrHTTPInternalServerError("Internal server error"))
}

func notFoundHandler(writer http.ResponseWriter, request *http.Request) {
	httputil.RespondWithError(writer, request, httputil.ErrHTTPNotFound(fmt.Sprintf("No resource found at path: %s", request.URL)))
}

func methodNotAllowedHandler(writer http.ResponseWriter, request *http.Request) {
	httputil.RespondWithError(writer, request, httputil.ErrHTTPMethodNotAllowed(fmt.Sprintf("Method Not Allowed: %s", request.Method)))
}
