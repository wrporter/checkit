package main

import (
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server"
	"log"
	"net/http"
)

func main() {
	s := server.New()
	log.Printf("listening on http://%s", env.AppDomain())
	log.Fatal(http.ListenAndServe(env.AppDomain(), s.SessionManager.LoadAndSave(s.Router)))
}
