package limit

import (
	"encoding/json"
	"github.com/didip/tollbooth/v6"
	"github.com/didip/tollbooth/v6/limiter"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"github.com/wrporter/checkit/server/internal/lib/httputil"
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

	return tollbooth.NewLimiter(0, options).
		SetIPLookups([]string{"RemoteAddr", "X-Forwarded-For", "X-Real-IP"}).
		SetBurst(0).
		SetMessageContentType("application/json").
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
