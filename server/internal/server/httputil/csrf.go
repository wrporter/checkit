package httputil

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

var errInvalidCSRFToken = ErrHTTPForbidden("Invalid CSRF token")

// CSRF is an HTTP adapter for providing CSRF protection on routes. It ensures that the XSRF-TOKEN cookie exists and matches the X-XSRF-TOKEN header
// sent with the request. If the criteria is not matched, a 403 Forbidden response will be returned.
func CSRF() Adapter {
	return func(handle httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			csrfToken, err := request.Cookie("XSRF-TOKEN")
			if err == http.ErrNoCookie {
				RespondWithError(writer, request, errInvalidCSRFToken)
				return
			}

			headerToken := request.Header.Get("X-XSRF-TOKEN")
			cookieValue := csrfToken.Value

			if headerToken == "" || headerToken != cookieValue {
				RespondWithError(writer, request, errInvalidCSRFToken)
				return
			}

			handle(writer, request, params)
		}
	}
}
