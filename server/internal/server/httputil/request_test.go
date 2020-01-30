package httputil

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
	"time"

	"github.com/julienschmidt/httprouter"
)

type errReader struct{}

func (er errReader) Read(p []byte) (n int, err error) {
	return 0, errors.New("COULD NOT READ")
}

func TestValidateRequestJSON(t *testing.T) {
	type validationTest struct {
		Val string `validate:"required"`
	}

	cases := []struct {
		name                       string
		t                          reflect.Type
		body                       io.Reader
		contentType                string
		expectedStatusCode         int
		expectedContextRequestBody interface{}
	}{
		{
			name:               "Regular Success Case",
			t:                  reflect.TypeOf(validationTest{}),
			body:               bytes.NewReader([]byte(`{"Val":"abc"}`)),
			expectedStatusCode: http.StatusTeapot,
			expectedContextRequestBody: &validationTest{
				Val: "abc",
			},
		},
		{
			name:                       "Body is not valid json",
			t:                          reflect.TypeOf(validationTest{}),
			body:                       bytes.NewReader([]byte(`Hello. I am not JSON.`)),
			expectedStatusCode:         http.StatusBadRequest,
			expectedContextRequestBody: nil,
		},
		{
			name:                       "Body fails validation",
			t:                          reflect.TypeOf(validationTest{}),
			body:                       bytes.NewReader([]byte(`{"Val":""}`)),
			expectedStatusCode:         http.StatusBadRequest,
			expectedContextRequestBody: nil,
		},
		{
			name:                       "Error reading request body",
			t:                          reflect.TypeOf(validationTest{}),
			body:                       errReader{},
			expectedStatusCode:         http.StatusInternalServerError,
			expectedContextRequestBody: nil,
		},
		{
			name:                       "Content type must be json",
			t:                          reflect.TypeOf(validationTest{}),
			body:                       bytes.NewReader([]byte(`{"Val":"abc"}`)),
			contentType:                "application/xml",
			expectedStatusCode:         http.StatusUnsupportedMediaType,
			expectedContextRequestBody: nil,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			var receivedContextRequestBody interface{}
			adapter := ValidateRequestJSON(c.t)
			handler := adapter(func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
				writer.WriteHeader(http.StatusTeapot)
				receivedContextRequestBody = request.Context().Value(RequestBodyKey)
			})

			rr := httptest.NewRecorder()
			request := httptest.NewRequest("GET", "/", c.body)
			contentType := "application/json; charset=utf-8"
			if c.contentType != "" {
				contentType = c.contentType
			}
			request.Header.Add("Content-Type", contentType)

			handler(rr, request, nil)

			response := rr.Result()
			if response.StatusCode != c.expectedStatusCode {
				t.Errorf("Expected status code %d but got %d", c.expectedStatusCode, response.StatusCode)
			}

			if !reflect.DeepEqual(receivedContextRequestBody, c.expectedContextRequestBody) {
				t.Errorf("Expected response body to be \"%v\"(%T) but got \"%v\"(%T)", c.expectedContextRequestBody, c.expectedContextRequestBody, receivedContextRequestBody, receivedContextRequestBody)
			}
		})
	}
}

type fakeDefaultProducer struct {
	DefaultFunc func() interface{}
	Value       string `validate:"required"`
	Date        time.Time
}

func (*fakeDefaultProducer) Default() interface{} {
	return &fakeDefaultProducer{}
}

func TestValidateQuery(t *testing.T) {
	cases := []struct {
		name                        string
		defaultProducer             DefaultProducer
		query                       map[string]string
		contentType                 string
		expectedStatusCode          int
		expectedContextRequestQuery interface{}
	}{
		{
			name:                        "Validation passes",
			defaultProducer:             &fakeDefaultProducer{},
			query:                       map[string]string{"Value": "abc"},
			expectedStatusCode:          http.StatusTeapot,
			expectedContextRequestQuery: &fakeDefaultProducer{Value: "abc"},
		},
		{
			name:                        "Query fails to be decoded",
			defaultProducer:             &fakeDefaultProducer{},
			query:                       map[string]string{"Date": "abc"},
			expectedStatusCode:          http.StatusBadRequest,
			expectedContextRequestQuery: nil,
		},
		{
			name:                        "Query fails validation",
			defaultProducer:             &fakeDefaultProducer{},
			query:                       map[string]string{"Value": ""},
			expectedStatusCode:          http.StatusBadRequest,
			expectedContextRequestQuery: nil,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			var receivedContextRequestQuery interface{}
			adapter := ValidateQuery(c.defaultProducer)
			handler := adapter(func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
				writer.WriteHeader(http.StatusTeapot)
				receivedContextRequestQuery = request.Context().Value(RequestQueryKey)
			})

			rr := httptest.NewRecorder()
			request := httptest.NewRequest("GET", "/", nil)

			query := request.URL.Query()
			for k, v := range c.query {
				query.Add(k, v)
			}
			request.URL.RawQuery = query.Encode()

			handler(rr, request, nil)

			response := rr.Result()
			if response.StatusCode != c.expectedStatusCode {
				t.Errorf("Expected status code %d but got %d", c.expectedStatusCode, response.StatusCode)
			}

			if !reflect.DeepEqual(receivedContextRequestQuery, c.expectedContextRequestQuery) {
				t.Errorf("Expected response body to be \"%v\"(%T) but got \"%v\"(%T)", c.expectedContextRequestQuery, c.expectedContextRequestQuery, receivedContextRequestQuery, receivedContextRequestQuery)
			}
		})
	}
}
