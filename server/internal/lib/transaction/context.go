package transaction

import (
	"context"
)

const ContextKey = "transaction.context"

// FromContext returns transaction information from the given context.
func FromContext(c context.Context) (Transaction, bool) {
	v, ok := c.Value(ContextKey).(Transaction)
	if !ok {
		return Transaction{}, false
	}
	return v, true
}

// SetOnContext stores transaction information on the given context to provide
// transaction details down the request call stack.
func SetOnContext(c context.Context, t Transaction) context.Context {
	return context.WithValue(c, ContextKey, t)
}
