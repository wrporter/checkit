package main

import (
	"fmt"
	"github.com/julienschmidt/httprouter"
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server"
	"log"
	"net/http"
)

var (
	appPort = env.DefaultEnv("APP_PORT", "9000")
)

func main() {
	s := server.New()
	s.Router.GET("/api", func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
	})

	log.Printf("listening on http://%s:%s/", "localhost:", appPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", appPort), s.SessionManager.LoadAndSave(s.Router)))
}
