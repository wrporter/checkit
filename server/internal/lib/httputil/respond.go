package httputil

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"reflect"
	"strconv"
	"time"

	"github.com/pkg/errors"
)

type (
	HTTPError struct {
		// HTTP status code.
		//
		// Example: 400
		Status int `json:"status"`

		// Description of the error and how to fix it.
		//
		// Example: There were validation errors. Correct the errors and try again.
		Message string `json:"message"`

		// Time the error occurred.
		Time time.Time `json:"time"`

		// Validation errors when fields in a request body are invalid.
		Errors []fieldValidationError `json:"errors,omitempty"`
	}
	fieldValidationError struct {
		// Invalid field that needs to be corrected.
		//
		// Example: limit
		Field string `json:"field"`

		// Description of the error and how to fix it.
		//
		// Example: Must be a positive integer.
		Error string `json:"error"`

		// Invalid provided value, if any.
		//
		// Example: -5
		RejectedValue interface{} `json:"rejectedValue,omitempty"`
	}
)

func InternalError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, HTTPError{
		Status:  http.StatusInternalServerError,
		Message: message,
		Time:    time.Now(),
	})
}

func Error(c *gin.Context, code int, message string) {
	c.JSON(code, HTTPError{
		Status:  code,
		Message: message,
		Time:    time.Now(),
	})
}

func ToHTTPError(status int, message string) HTTPError {
	return HTTPError{
		Status:  status,
		Message: message,
		Time:    time.Now(),
	}
}

// RespondWithJSON is a helper function that responds with a JSON version of the data
func RespondWithJSON(writer http.ResponseWriter, request *http.Request, data interface{}, statusCode int) {
	responseBody, err := json.Marshal(data)
	if err != nil {
		panic(errors.Wrap(err, "Failed to parse response body"))
	}

	writer.Header().Set("Content-Type", "application/json; charset=UTF-8")
	writer.Header().Set("Content-Length", strconv.Itoa(len(responseBody)))
	writer.WriteHeader(statusCode)
	fmt.Fprintf(writer, "%s", responseBody)
}

// RespondWithError is a helper function that selects an appropriate response code for the given error and sends back a JSON version of the message
func RespondWithError(writer http.ResponseWriter, request *http.Request, err error) {
	// TODO be helpful and attach the failure mode to the access log
	// accesslog.Set(request.Context(), "failure", err.Error())

	response := HTTPError{500, "Internal Server Error", time.Now(), nil}

	// switch on error value
	switch err {

	case context.Canceled:
		response.Status = http.StatusServiceUnavailable
		response.Message = fmt.Sprintf("Canceled internally: %s", err)

	case context.DeadlineExceeded:
		response.Status = http.StatusServiceUnavailable
		response.Message = fmt.Sprintf("Deadline reached: %s", err)

	default:
		// type switch on error type
		switch err := err.(type) {
		case ErrHTTP:
			response.Status = err.StatusCode()
			response.Message = err.Error()
		}
	}
	RespondWithJSON(writer, request, response, response.Status)
}

func isEmpty(value interface{}) bool {
	return reflect.DeepEqual(value, reflect.Zero(reflect.TypeOf(value)).Interface())
}
