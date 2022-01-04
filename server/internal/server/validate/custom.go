package validate

import (
	"github.com/go-playground/validator/v10"
	"regexp"
	"strings"
)

var (
	qualtricsIDRegex = regexp.MustCompile("^[0-9a-zA-Z]{11,15}$")
)

func registerCustomValidators(d *DefaultValidator) {
	d.RegisterValidator("qualtricsGUID", qualtricsGUID, "{0} must be a qualtrics GUID prefixed by one of [{1}]")
}

func qualtricsGUID(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	validPrefixes := strings.Split(fl.Param(), " ")

	for _, prefix := range validPrefixes {
		if len(prefix) == 0 {
			continue
		}
		prefix = prefix + "_"
		if len(prefix) < len(value) && value[:len(prefix)] == prefix {
			return qualtricsIDRegex.MatchString(value[len(prefix):])
		}
	}

	return false
}
