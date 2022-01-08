package main

import (
	"github.com/gin-gonic/gin"
	"github.com/wrporter/checkit/server/internal/app"
	"github.com/wrporter/checkit/server/internal/env"
	"github.com/wrporter/checkit/server/internal/log"
	"github.com/wrporter/checkit/server/internal/server"
	"github.com/wrporter/checkit/server/internal/server/auth"
	"github.com/wrporter/checkit/server/internal/server/items"
	"github.com/wrporter/checkit/server/internal/transaction"
	"go.uber.org/zap"
	"net/http"
)

func main() {
	log.MustInit()

	s := server.New()
	auth.RegisterRoutes(s)
	items.RegisterRoutes(s)
	s.Router.GET("/api/version", gin.WrapF(app.VersionHandlerFunc))

	zap.S().Infof("Listening at %s", env.AppDomain())
	zap.S().Fatal(
		http.ListenAndServe(env.AppDomain(),
			transaction.WrapWithTransactionHeaders(
				s.SessionManager.Manager.LoadAndSave(
					s,
				),
			),
		),
	)
}
