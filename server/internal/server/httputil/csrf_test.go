package httputil

import (
	"github.com/julienschmidt/httprouter"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
)

func TestCSRF(t *testing.T) {
	tests := []struct {
		name              string
		headers           map[string]string
		expectCSRFSuccess bool
	}{
		{
			"CSRF succeeds",
			map[string]string{
				"Cookie":       "XSRF-TOKEN=my-xsrf-token",
				"X-XSRF-TOKEN": "my-xsrf-token",
			},
			true,
		},
		{
			"CSRF fails for no cookie",
			map[string]string{
				"X-XSRF-TOKEN": "my-xsrf-token",
			},
			false,
		},
		{
			"CSRF fails for no header",
			map[string]string{
				"Cookie": "XSRF-TOKEN=my-xsrf-token",
			},
			false,
		},
		{
			"CSRF fails for empty header",
			map[string]string{
				"X-XSRF-TOKEN": "",
				"Cookie":       "",
			},
			false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/", nil)
			w := httptest.NewRecorder()
			router := httprouter.New()
			for k, v := range tt.headers {
				r.Header.Set(k, v)
			}
			csrfSuccess := false

			router.GET("/", Adapt(func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
				csrfSuccess = true
			}, CSRF()))

			router.ServeHTTP(w, r)

			if tt.expectCSRFSuccess != csrfSuccess {
				t.Errorf("Expected CSRF success to be %t but got %t", tt.expectCSRFSuccess, csrfSuccess)
			}

			failureRegex := `^\{"status":403,"message":"Invalid CSRF token","time":"[^\"]+","transactionID":"[^\"]*"}$`
			body, _ := ioutil.ReadAll(w.Body)
			match, _ := regexp.Match(failureRegex, body)
			if !tt.expectCSRFSuccess && !match {
				t.Errorf("Expected error response body to match %v, but got %s", failureRegex, body)
			}
		})
	}
}
