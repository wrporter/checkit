package ginzap

import (
	"bufio"
	"errors"
	"github.com/wrporter/checkit/server/internal/lib/log"
	transaction2 "github.com/wrporter/checkit/server/internal/lib/transaction"
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type (
	responseRecorder struct {
		gin.ResponseWriter
		bytesOut int
	}
)

func (w *responseRecorder) Write(b []byte) (int, error) {
	n, err := w.ResponseWriter.Write(b)
	w.bytesOut += n
	return n, err
}

func (w *responseRecorder) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	if hj, ok := w.ResponseWriter.(http.Hijacker); ok {
		return hj.Hijack()
	}
	return nil, nil, errors.New("error in hijacker")
}

// Access is a gin middleware that logs request access.
func Access() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		rw := &responseRecorder{ResponseWriter: c.Writer}
		c.Writer = rw

		c.Next()

		end := time.Now()
		latency := end.Sub(start)

		fields := []zapcore.Field{
			zap.String("event", "access"),
			zap.String("host", c.Request.Host),
			zap.String("clientIP", c.ClientIP()),
			zap.String("userAgent", c.Request.UserAgent()),
			zap.String("url", c.Request.URL.Path),
			zap.Int64("bytesIn", c.Request.ContentLength),
			zap.String("method", c.Request.Method),
			zap.Int("bytesOut", rw.bytesOut),
			zap.Int("status", c.Writer.Status()),
			zap.Int64("latency", latency.Milliseconds()),
		}

		log.LC(c.Request.Context()).With(fields...).Info("[access]")
	}
}

func AddUserID(c *gin.Context, userID string) {
	logContext := log.NewContext(c.Request.Context(), zap.String("userId", userID))
	c.Request = c.Request.WithContext(logContext)
}

// Recover is a gin middleware that logs panics and returns a 500 error.
func Recover() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Check for a broken connection, as it is not really a
				// condition that warrants a panic stack trace.
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					if se, ok := ne.Err.(*os.SyscallError); ok {
						if strings.Contains(strings.ToLower(se.Error()), "broken pipe") || strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				httpRequest, _ := httputil.DumpRequest(c.Request, false)
				if brokenPipe {
					log.LC(c.Request.Context()).Error(c.Request.URL.Path,
						zap.Any("error", err),
						zap.String("request", string(httpRequest)),
					)
					// If the connection is dead, we can't write a status to it.
					c.Error(err.(error)) // nolint: errcheck
					c.Abort()
					return
				}

				log.LC(c.Request.Context()).Error("[Recovery from panic]",
					zap.Time("time", time.Now()),
					zap.Any("error", err),
					zap.String("request", string(httpRequest)),
					zap.String("stack", string(debug.Stack())),
				)

				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()

		c.Next()
	}
}

// Transaction sets transaction headers on the request's context and sets the
// outgoing transaction headers.
func Transaction() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := transaction2.FromRequest(c.Request)

		// Set headers on the context and request
		ctx := transaction2.SetOnContext(c.Request.Context(), t)

		// Set outgoing headers
		transaction2.SetResponseHeaders(c.Writer, t)

		// Add transaction data to logs
		ctx = log.NewContext(ctx, zap.String("transactionId", t.TransactionID))
		ctx = log.NewContext(ctx, zap.String("requestId", t.RequestID))
		if t.ParentRequestID != "" {
			ctx = log.NewContext(ctx, zap.String("parentRequestId", t.ParentRequestID))
		}

		c.Request = c.Request.WithContext(ctx)
	}
}
