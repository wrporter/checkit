// Package transaction provides the means for tracing HTTP requests in a
// system.
package transaction

// Transaction defines tracing identifiers for a request.
type Transaction struct {
	// TransactionID represents the lifetime of a transaction.
	TransactionID string

	// RequestID represents the lifetime of a request in a single service layer
	// or application.
	RequestID string

	// ParentRequestID represents the lifetime of a request from a previous
	// layer of a service or application call.
	ParentRequestID string
}
