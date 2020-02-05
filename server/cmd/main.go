package main

import (
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server"
	"github.com/wrporter/games-app/server/internal/server/auth"
	"github.com/wrporter/games-app/server/internal/server/items"
	"log"
	"net/http"
)

func main() {
	s := server.New()
	auth.RegisterRoutes(s)
	items.RegisterRoutes(s)

	log.Printf("listening on http://%s", env.AppDomain())
	log.Fatal(http.ListenAndServe(env.AppDomain(), s.SessionManager.LoadAndSave(s.Router)))
}
