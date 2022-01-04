package limit

import (
	"encoding/json"
	"github.com/didip/tollbooth"
	"github.com/didip/tollbooth/limiter"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"time"
)

func buildLimit() *limiter.Limiter {
	options := &limiter.ExpirableOptions{
		DefaultExpirationTTL: time.Hour,
	}

	responseBody, err := json.Marshal(httputil.HTTPError{
		Status:  429,
		Message: "Maximum request limit has been reached. Wait until limit has been refreshed to make more requests.",
		Time:    time.Now(),
	})
	if err != nil {
		panic(errors.Wrap(err, "Failed to parse response body"))
	}

	return tollbooth.NewLimiter(5, options).
		SetIPLookups([]string{"RemoteAddr", "X-Forwarded-For", "X-Real-IP"}).
		SetBurst(10).
		SetMessageContentType("application/json; charset=UTF-8").
		SetMessage(string(responseBody))
}

func WithRateLimit() gin.HandlerFunc {
	limit := buildLimit()

	return func(c *gin.Context) {
		httpError := tollbooth.LimitByRequest(limit, c.Writer, c.Request)
		if httpError != nil {
			c.Header("Content-Type", limit.GetMessageContentType())
			c.String(httpError.StatusCode, httpError.Message)
			c.Abort()
		}
	}
}
