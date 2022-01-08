package transaction

import (
	"github.com/google/uuid"
	"github.com/wrporter/checkit/server/internal/log"
	"go.uber.org/zap"
	"net/http"
)

const (
	headerTransactionID   string = "X-Transaction-ID"
	headerRequestID       string = "X-Request-ID"
	headerParentRequestID string = "X-Parent-Request-ID"
)

// FromRequest reads transaction headers from an incoming http.Request and
// generates necessary or missing identifiers.
func FromRequest(r *http.Request) Transaction {
	// Populate a transaction by reading values directly from the headers.
	t := Transaction{
		TransactionID:   r.Header.Get(headerTransactionID),
		RequestID:       uuid.New().String(),
		ParentRequestID: r.Header.Get(headerParentRequestID),
	}

	if t.TransactionID == "" {
		t.TransactionID = uuid.New().String()
	}

	return t
}

// SetRequestHeaders sets transaction headers on the outgoing http.Request.
func SetRequestHeaders(r *http.Request, t Transaction) {
	r.Header.Set(headerTransactionID, t.TransactionID)
	r.Header.Set(headerParentRequestID, t.RequestID)
}

// SetResponseHeaders sets transaction headers on the outgoing
// http.ResponseWriter.
func SetResponseHeaders(w http.ResponseWriter, t Transaction) {
	w.Header().Set(headerTransactionID, t.TransactionID)
	w.Header().Set(headerRequestID, t.RequestID)
}

// WrapWithTransactionHeaders sets transaction headers on the request's context
// and sets the outgoing transaction headers.
func WrapWithTransactionHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t := FromRequest(r)

		// Set headers on the context and request
		ctx := SetOnContext(r.Context(), t)

		// Set outgoing headers
		SetResponseHeaders(w, t)

		// Add transaction data to logs
		ctx = log.NewContext(ctx, zap.String("transactionId", t.TransactionID))
		ctx = log.NewContext(ctx, zap.String("requestId", t.RequestID))
		if t.ParentRequestID != "" {
			ctx = log.NewContext(ctx, zap.String("parentRequestId", t.ParentRequestID))
		}

		h.ServeHTTP(w, r.WithContext(ctx))
	})
}
