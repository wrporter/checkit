package validate

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"reflect"
	"sync"
)

type (
	DefaultGinValidator struct {
		once      sync.Once
		validator *DefaultValidator
	}
)

var (
	ContextKeyRequestBody = "requestBody"
)

func (v *DefaultGinValidator) ValidateStruct(obj interface{}) error {
	v.lazyInit()
	return v.validator.Validate.Struct(obj)
}

func (v *DefaultGinValidator) Engine() interface{} {
	v.lazyInit()
	return v.validator.Validate
}

func (v *DefaultGinValidator) RegisterValidator(name string, validatorFunc func(fl validator.FieldLevel) bool, errorMessage string) {
	v.lazyInit()
	v.validator.RegisterValidator(name, validatorFunc, errorMessage)
}

func (v *DefaultGinValidator) lazyInit() {
	v.once.Do(func() {
		v.validator = GetDefaultValidator()
		v.validator.Validate.SetTagName("validate")
	})
}

func RequestBody(obj interface{}) gin.HandlerFunc {
	// TODO: Consider the option pattern: validate.RequestBody(validate.WithInterface(xxx), validate.WithMaxContentLength(xxx))
	objectType := reflect.TypeOf(obj)

	return func(c *gin.Context) {
		requestBody := reflect.New(objectType).Interface()
		if err := c.ShouldBindJSON(requestBody); err != nil {
			c.JSON(http.StatusBadRequest, ToHTTPError(err))
			c.Abort()
			return
		}
		// TODO: it might not be a good pattern to store data on the context
		c.Set(ContextKeyRequestBody, requestBody)
	}
}

func GetRequestBody(c *gin.Context) interface{} {
	requestBody, _ := c.Get(ContextKeyRequestBody)
	return requestBody
}
