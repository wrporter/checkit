package httputil

import (
	"net/http"

	"github.com/pkg/errors"
)

// Errors used in various places in the project
var (
	ErrMissingRequestBody  = errors.New("missing request body")
	ErrMissingRequestQuery = errors.New("missing request query")
)

// Special error types that know which HTTP StatusCode to respond with
type (
	ErrHTTP interface {
		error
		StatusCode() int
	}
	ErrHTTPBadRequest           string
	ErrHTTPUnauthorized         string
	ErrHTTPForbidden            string
	ErrHTTPNotFound             string
	ErrHTTPMethodNotAllowed     string
	ErrHTTPUnsupportedMediaType string
	ErrHTTPInternalServerError  string
)

func (err ErrHTTPBadRequest) Error() string {
	return string(err)
}

func (err ErrHTTPBadRequest) StatusCode() int {
	return http.StatusBadRequest
}

func (err ErrHTTPUnauthorized) Error() string {
	return string(err)
}

func (err ErrHTTPUnauthorized) StatusCode() int {
	return http.StatusUnauthorized
}

func (err ErrHTTPForbidden) Error() string {
	return string(err)
}

func (err ErrHTTPForbidden) StatusCode() int {
	return http.StatusForbidden
}

func (err ErrHTTPNotFound) Error() string {
	return string(err)
}

func (err ErrHTTPNotFound) StatusCode() int {
	return http.StatusNotFound
}

func (err ErrHTTPMethodNotAllowed) Error() string {
	return string(err)
}

func (err ErrHTTPMethodNotAllowed) StatusCode() int {
	return http.StatusMethodNotAllowed
}

func (err ErrHTTPUnsupportedMediaType) Error() string {
	return string(err)
}

func (err ErrHTTPUnsupportedMediaType) StatusCode() int {
	return http.StatusUnsupportedMediaType
}

func (err ErrHTTPInternalServerError) Error() string {
	return string(err)
}

func (err ErrHTTPInternalServerError) StatusCode() int {
	return http.StatusInternalServerError
}
