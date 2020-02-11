package limit

import (
	"encoding/json"
	"github.com/didip/tollbooth"
	"github.com/didip/tollbooth/limiter"
	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"net/http"
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

func WithRateLimit() httputil.Adapter {
	limit := buildLimit()

	return func(next httprouter.Handle) httprouter.Handle {
		return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
			httpError := tollbooth.LimitByRequest(limit, w, r)
			if httpError != nil {
				w.Header().Add("Content-Type", limit.GetMessageContentType())
				w.WriteHeader(httpError.StatusCode)
				w.Write([]byte(httpError.Message))
				return
			}

			next(w, r, ps)
		}
	}
}
