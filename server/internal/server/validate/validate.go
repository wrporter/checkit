package validate

import (
	"github.com/go-playground/locales/en"
	"github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	enTranslations "github.com/go-playground/validator/v10/translations/en"
	"reflect"
	"strings"
	"sync"
)

var (
	once      sync.Once
	singleton *DefaultValidator
)

type DefaultValidator struct {
	Validate   *validator.Validate
	Translator ut.Translator
}

func GetDefaultValidator() *DefaultValidator {
	once.Do(func() {
		singleton = &DefaultValidator{
			Validate:   validator.New(),
			Translator: nil,
		}

		singleton.setupTranslations()
		singleton.transformToJSONNamespaces()
		registerCustomValidators(singleton)
	})

	return singleton
}

func (d *DefaultValidator) transformToJSONNamespaces() {
	d.Validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
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

func (d *DefaultValidator) setupTranslations() {
	e := en.New()
	uni := ut.New(e, e)
	d.Translator, _ = uni.GetTranslator("en")
	d.Validate = validator.New()
	_ = enTranslations.RegisterDefaultTranslations(d.Validate, d.Translator)
}

func (d *DefaultValidator) RegisterValidator(name string, validatorFunc func(fl validator.FieldLevel) bool, errorMessage string) {
	_ = d.Validate.RegisterValidation(name, validatorFunc)
	_ = d.Validate.RegisterTranslation(name, d.Translator, func(ut ut.Translator) error {
		return ut.Add(name, errorMessage, true)
	}, func(ut ut.Translator, fe validator.FieldError) string {
		t, _ := ut.T(name, fe.Field(), fe.Param())
		return t
	})
}
