package transaction

import (
	"github.com/google/uuid"
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
