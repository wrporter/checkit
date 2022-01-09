package httputil

import "testing"

func TestHTTPErrors(t *testing.T) {
	tests := []struct {
		name           string
		err            ErrHTTP
		expectedStatus int
	}{
		{"400 Bad Request", ErrHTTPBadRequest("400 Bad Request"), 400},
		{"401 Unauthorized", ErrHTTPUnauthorized("401 Unauthorized"), 401},
		{"403 Forbidden", ErrHTTPForbidden("403 Forbidden"), 403},
		{"404 Not Found", ErrHTTPNotFound("404 Not Found"), 404},
		{"405 Method Not Allowed", ErrHTTPMethodNotAllowed("405 Method Not Allowed"), 405},
		{"415 Unsupported Media Type", ErrHTTPUnsupportedMediaType("415 Unsupported Media Type"), 415},
		{"500 Internal Server Error", ErrHTTPInternalServerError("500 Internal Server Error"), 500},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.err.StatusCode() != tt.expectedStatus {
				t.Errorf("Expected status code to be %d, but got %d", tt.expectedStatus, tt.err.StatusCode())
			}
			if tt.err.Error() != tt.name {
				t.Errorf("Expected error message to be %s, but got %s", tt.name, tt.err.Error())
			}
		})
	}
}
