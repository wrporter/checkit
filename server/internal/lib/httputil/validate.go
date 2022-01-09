package httputil

import (
	"reflect"
	"strings"

	"github.com/go-playground/locales/en"
	"github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	enTranslations "github.com/go-playground/validator/v10/translations/en"
)

var (
	validate   = validator.New()
	translator ut.Translator
)

func init() {
	setupTranslations()
	transformToJSONNamespaces()
}

func transformToJSONNamespaces() {
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]

		if name == "" {
			name = strings.SplitN(fld.Tag.Get("form"), ",", 2)[0]
		}

		if name == "-" {
			return ""
		}

		return name
	})
}

func setupTranslations() {
	e := en.New()
	uni := ut.New(e, e)
	translator, _ = uni.GetTranslator("en")
	validate = validator.New()
	_ = enTranslations.RegisterDefaultTranslations(validate, translator)
}

// ValidateStruct makes sure the struct is valid
func ValidateStruct(val interface{}) error {
	return validate.Struct(val)
}

func Translator() ut.Translator {
	return translator
}

func ValidateUUID(uuid string) error {
	return validator.New().Var(uuid, "uuid")
}

func RegisterValidator(name string, validatorFunc func(fl validator.FieldLevel) bool, errorMessage string) {
	_ = validate.RegisterValidation(name, validatorFunc)
	_ = validate.RegisterTranslation(name, translator, func(ut ut.Translator) error {
		return ut.Add(name, errorMessage, true)
	}, func(ut ut.Translator, fe validator.FieldError) string {
		t, _ := ut.T(name, fe.Field())
		return t
	})
}
