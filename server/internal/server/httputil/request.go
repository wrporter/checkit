package httputil

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/form"
	"github.com/julienschmidt/httprouter"
)

type DefaultProducer interface {
	// Default returns a pointer to a struct object.
	Default() interface{}
}

// ValidateRequestJSON is an Adapter that unmarshals the request body as JSON, validates it, then puts it on the context
func ValidateRequestJSON(container interface{}) Adapter {
	t := reflect.TypeOf(container)
	return func(handle httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			b, err := ioutil.ReadAll(request.Body)
			if err != nil {
				RespondWithError(writer, request, err)
				return
			}
			_ = request.Body.Close()
			request.Body = ioutil.NopCloser(bytes.NewReader(b))

			requestBody := reflect.New(t).Interface()

			contentType := "application/json"
			if !strings.EqualFold(request.Header.Get("Content-Type"), contentType) {
				RespondWithError(writer, request, ErrHTTPUnsupportedMediaType(fmt.Sprintf("Unsupported Media Type: %s. Must be of type: %s", request.Header.Get("Content-Type"), contentType)))
				return
			}

			if err := json.Unmarshal(b, requestBody); err != nil {
				RespondWithError(writer, request, ErrHTTPBadRequest(fmt.Sprintf("JSON parse error: %s", err.Error())))
				return
			}

			if t.Kind() == reflect.Struct {
				if err := ValidateStruct(requestBody); err != nil {
					RespondWithError(writer, request, err)
					return
				}
			}

			ctx := context.WithValue(request.Context(), RequestBodyKey, requestBody)
			request = request.WithContext(ctx)
			handle(writer, request, params)
		}
	}
}

// ValidateQuery uses a struct type to validate the query parameters provided
// on the request URL. If the values cannot be decoded into the proper types
// or do not match the validation criteria, a 400 Bad Request will be returned
// to the client.
//
// For ease of use, the query values are stored on the request context so users
// do not have to perform decoding again.
func ValidateQuery(defaultProducer DefaultProducer) Adapter {
	return func(handle httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			values := request.URL.Query()
			query := defaultProducer.Default()

			err := form.NewDecoder().Decode(query, values)
			if err != nil {
				RespondWithError(writer, request, ErrHTTPBadRequest(err.Error()))
				return
			}

			err = ValidateStruct(query)
			if err != nil {
				RespondWithError(writer, request, err)
				return
			}

			ctx := context.WithValue(request.Context(), RequestQueryKey, query)
			request = request.WithContext(ctx)
			handle(writer, request, params)
		}
	}
}
