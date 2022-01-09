package validate

import (
	"encoding/json"
	"fmt"
	"github.com/go-playground/validator/v10"
	"net/http"
	"reflect"
	"strings"
	"time"
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
	}

	HTTPValidationError struct {
		HTTPError

		// Validation errors when fields in a request body are invalid.
		Errors []fieldError `json:"errors,omitempty"`
	}

	HTTPUnmarshalError struct {
		HTTPError

		Error fieldError `json:"error,omitempty"`
	}

	fieldError struct {
		// Invalid fieldLevelMock that needs to be corrected.
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

func ToHTTPError(err error) *HTTPValidationError {
	if unmarshalTypeError, ok := err.(*json.UnmarshalTypeError); ok {
		return &HTTPValidationError{
			HTTPError: HTTPError{
				Status:  http.StatusBadRequest,
				Message: "Request format is incorrect",
				Time:    time.Now(),
			},
			Errors: []fieldError{{
				Field: unmarshalTypeError.Field,
				Error: fmt.Sprintf("Expected to be of type `%s`, but got `%s`", unmarshalTypeError.Type, unmarshalTypeError.Value),
			}},
		}
	}

	if _, ok := err.(validator.ValidationErrors); !ok {
		return &HTTPValidationError{
			HTTPError: HTTPError{
				Status:  http.StatusBadRequest,
				Message: err.Error(),
				Time:    time.Now(),
			},
		}
	}

	var validationErrors []fieldError
	for _, validationError := range err.(validator.ValidationErrors) {
		index := strings.Index(validationError.Namespace(), ".") + 1
		namespace := validationError.Namespace()[index:]

		rejectedValue := validationError.Value()
		if isEmpty(validationError.Value()) {
			rejectedValue = nil
		}

		validationErrors = append(validationErrors, fieldError{
			namespace,
			validationError.Translate(GetDefaultValidator().Translator),
			rejectedValue,
		})
	}

	return &HTTPValidationError{
		HTTPError: HTTPError{
			Status:  http.StatusBadRequest,
			Message: "There were validation errors. Correct the errors and try again.",
			Time:    time.Now(),
		},
		Errors: validationErrors,
	}
}

func isEmpty(value interface{}) bool {
	return reflect.DeepEqual(value, reflect.Zero(reflect.TypeOf(value)).Interface())
}
