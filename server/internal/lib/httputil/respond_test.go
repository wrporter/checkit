package httputil

import (
	"context"
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"reflect"
	"regexp"
	"testing"
)

func TestRespondWithJSON(t *testing.T) {
	cases := []struct {
		shouldPanic          bool
		data                 interface{}
		statusCode           int
		expectedStatusCode   int
		expectedResponseBody []byte
	}{
		// [0] Marshal simple map
		{
			data:                 map[string]string{"testing": "123"},
			statusCode:           http.StatusOK,
			expectedStatusCode:   http.StatusOK,
			expectedResponseBody: []byte(`{"testing":"123"}`),
		},
		// [1] Marshal simple slice
		{
			data:                 []string{"T", "E", "S", "T"},
			statusCode:           http.StatusOK,
			expectedStatusCode:   http.StatusOK,
			expectedResponseBody: []byte(`["T","E","S","T"]`),
		},
		// [2] Marshal simple struct
		{
			data: struct {
				Test string `json:"testing"`
			}{
				Test: "123",
			},
			statusCode:           http.StatusOK,
			expectedStatusCode:   http.StatusOK,
			expectedResponseBody: []byte(`{"testing":"123"}`),
		},
		// [3] Respond with nil
		{
			data:                 nil,
			statusCode:           http.StatusOK,
			expectedStatusCode:   http.StatusOK,
			expectedResponseBody: []byte(`null`),
		},
		// [4] Non 200 status code
		{
			data:                 nil,
			statusCode:           http.StatusNotFound,
			expectedStatusCode:   http.StatusNotFound,
			expectedResponseBody: []byte(`null`),
		},
		// [5] Marshal JSON incompatible type
		{
			shouldPanic:          true,
			data:                 make(chan string),
			statusCode:           http.StatusOK,
			expectedStatusCode:   http.StatusBadRequest,
			expectedResponseBody: []byte(`{"message":"JSON parse error: json: unsupported type: chan string"}`),
		},
	}

	for i, c := range cases {
		defer func() {
			if r := recover(); r != nil && !c.shouldPanic {
				t.Errorf("TestRespondWithJSON [case %d] not expected to panic, but did", i)
			}
		}()
		rr := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/", nil)
		RespondWithJSON(rr, req, c.data, c.statusCode)
		result := rr.Result()
		defer result.Body.Close()
		if result.StatusCode != c.expectedStatusCode {
			t.Errorf("TestRespondWithJSON [case %d] expected status code %d but got %d", i, c.expectedStatusCode, result.StatusCode)
		}

		responseBody, _ := ioutil.ReadAll(result.Body)

		if !reflect.DeepEqual(c.expectedResponseBody, responseBody) {
			t.Errorf("TestRespondWithJSON [case %d] expected body \"%s\" but got \"%s\"", i, string(c.expectedResponseBody), string(responseBody))
		}

	}
}
func TestRespondWithError(t *testing.T) {
	cases := []struct {
		err                error
		expectedStatusCode int
	}{
		// [0] random error
		{
			err:                errors.New("Internal Server Error"),
			expectedStatusCode: http.StatusInternalServerError,
		},
		// [1] context.Canceled
		{
			err:                context.Canceled,
			expectedStatusCode: http.StatusServiceUnavailable,
		},
		// [2] context.DeadlineExceeded
		{
			err:                context.DeadlineExceeded,
			expectedStatusCode: http.StatusServiceUnavailable,
		},
		// [3] ErrAuthenticationFailed
		{
			err:                ErrHTTPUnauthorized("unauthorized"),
			expectedStatusCode: http.StatusUnauthorized,
		},
		// [3] ErrHTTPBadRequest
		{
			err:                ErrHTTPBadRequest("you thought you could get away with sending me that? HA."),
			expectedStatusCode: http.StatusBadRequest,
		},
	}

	for i, c := range cases {
		rr := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/", nil)
		ctx := context.Background()
		//tx := transaction.Transaction{TransactionID: "b99ef861-9978-4042-887c-5ff6c8861e6c"}
		//ctx = transaction.SetOnContext(ctx, tx)
		req = req.WithContext(ctx)
		RespondWithError(rr, req, c.err)
		result := rr.Result()
		defer result.Body.Close()
		if result.StatusCode != c.expectedStatusCode {
			t.Errorf("TestRespondWithError [case %d] expected status code %d but got %d", i, c.expectedStatusCode, result.StatusCode)
		}
		responseBody, _ := ioutil.ReadAll(result.Body)
		match, _ := regexp.Match(`^\{"status":[^\"]+,"message":"[^\"]+","time":"[^\"]+","transactionID":"[^\"]+"}$`, responseBody)
		if !match {
			t.Errorf("TestRespondWithError [case %d] response does not match expected pattern \"%s\"", i, string(responseBody))
		}
	}
}
