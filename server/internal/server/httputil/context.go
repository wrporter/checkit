package httputil

import (
	"net/http"
)

type (
	contextKey string
)

// Keys that are used to store data on the request context
const (
	RequestBodyKey  contextKey = "requestBody"
	RequestQueryKey contextKey = "requestQuery"
)

func GetRequestBody(r *http.Request) interface{} {
	return r.Context().Value(RequestBodyKey)
}
