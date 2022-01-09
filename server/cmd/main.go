package main

import (
	"github.com/wrporter/checkit/server/internal/lib/env"
	"github.com/wrporter/checkit/server/internal/lib/gin/auth/oauth"
	"github.com/wrporter/checkit/server/internal/lib/log"
	"github.com/wrporter/checkit/server/internal/server"
	"github.com/wrporter/checkit/server/internal/server/items"
	"go.uber.org/zap"
	"net/http"
)

func main() {
	log.MustInit()

	s := server.New()
	oauth.RegisterRoutes(s)
	items.RegisterRoutes(s)

	zap.S().Infof("Listening at %s", env.AppDomain())
	zap.S().Fatal(
		http.ListenAndServe(env.AppDomain(),
			s.SessionManager.LoadAndSave(s),
		),
	)
}
