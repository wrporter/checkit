package server

import (
	"context"
	"fmt"
	"github.com/alexedwards/scs/v2"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"log"
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
		SessionManager *scs.SessionManager
		Store          store.Store
	}
)

func New() *Server {
	return &Server{
		Router:         setupRouter(),
		SessionManager: session.SetupSessionManager(),
		Store:          store.New(),
	}
}

func setupRouter() *httprouter.Router {
	router := httprouter.New()
	router.PanicHandler = panicHandler
	router.NotFound = http.HandlerFunc(notFoundHandler)
	router.MethodNotAllowed = http.HandlerFunc(methodNotAllowedHandler)
	return router
}

func (server *Server) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	ctx, cancel := context.WithTimeout(request.Context(), requestTimeout)
	defer cancel()

	// TODO apply context data such as request transaction identifiers
	request = request.WithContext(ctx)

	server.Router.ServeHTTP(writer, request)
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
