package httputil

import (
	"github.com/go-playground/validator/v10"
	"testing"
)

func Test_validateAbsoluteURLPath(t *testing.T) {
	cases := []struct {
		name  string
		value interface{}
		valid bool
	}{
		{
			name: "Empty",
			value: struct {
				Val string `validate:"omitempty,absoluteURLPath"`
			}{""},
			valid: true,
		},
		{
			name: "Full URL",
			value: struct {
				Val string `validate:"absoluteURLPath"`
			}{"https://test.com/wiki/help"},
			valid: false,
		},
		{
			name: "Full URL without scheme",
			value: struct {
				Val string `validate:"absoluteURLPath"`
			}{"test.com/wiki/help"},
			valid: false,
		},
		{
			name: "Absolute path",
			value: struct {
				Val string `validate:"absoluteURLPath"`
			}{"/wiki/help"},
			valid: true,
		},
		{
			name: "Absolute path with query params",
			value: struct {
				Val string `validate:"absoluteURLPath"`
			}{"/wiki/help?you=awesome&we=team"},
			valid: true,
		},
	}

	for _, c := range cases {
		t.Run(string(c.name), func(t *testing.T) {
			err := ValidateStruct(c.value)
			valid := err == nil
			if valid != c.valid {
				t.Errorf("Expected %t but got %t", c.valid, valid)
			}
		})
	}
}

func Test_transformToJSONNamespaces(t *testing.T) {
	tests := []struct {
		name              string
		object            interface{}
		expectedFieldName string
	}{
		{
			"Uses json tag",
			struct {
				Value string `json:"value" validate:"required"`
			}{},
			"value",
		},
		{
			"Uses form tag",
			struct {
				Value string `form:"value" validate:"required"`
			}{},
			"value",
		},
		{
			"Ignores json tag",
			struct {
				Value string `json:"-" validate:"required"`
			}{},
			"Value",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateStruct(tt.object)
			validationError := err.(validator.ValidationErrors)[0]

			if validationError.Field() != tt.expectedFieldName {
				t.Errorf("Expected field name %s, but got %s", tt.expectedFieldName, validationError.Field())
			}
		})
	}
}

func TestTranslator(t *testing.T) {
	translator := Translator()
	if translator == nil {
		t.Error("Translator should not be nil")
	}
}

func Test_registerUUIDValidator(t *testing.T) {
	err := ValidateStruct(struct {
		Value string `validate:"uuid"`
	}{"01234"})

	validationError := err.(validator.ValidationErrors)[0]
	errorMessage := validationError.Translate(Translator())

	expectedErrorMessage := "Value must be a valid UUID"

	if errorMessage != expectedErrorMessage {
		t.Errorf("Expected error message to be '%s', but got %s", expectedErrorMessage, errorMessage)
	}
}

func Test_validateUUID_Struct(t *testing.T) {
	cases := []struct {
		name  string
		value interface{}
		valid bool
	}{
		{
			name: "Valid ID",
			value: struct {
				Val string `validate:"uuid"`
			}{"d6c1ea55-dbcb-4ab9-a2a1-363298c29b53"},
			valid: true,
		},
		{
			name: "Invalid Format",
			value: struct {
				Val string `validate:"uuid"`
			}{"01234"},
			valid: false,
		},
		{
			name: "Invalid Format, too long",
			value: struct {
				Val string `validate:"uuid"`
			}{"d6c1ea55-dbcb-4ab9-a2a1-363298c29b531"},
			valid: false,
		},
		{
			name: "Invalid Format, no dashes",
			value: struct {
				Val string `validate:"uuid"`
			}{"d6c1ea55dbcb4ab9a2a1363298c29b53"},
			valid: false,
		},
		{
			name: "No uuid passed in",
			value: struct {
				Val string `validate:"uuid"`
			}{},
			valid: false,
		},
		{
			name: "Empty string uuid passed in",
			value: struct {
				Val string `validate:"uuid"`
			}{""},
			valid: false,
		},
	}

	for _, c := range cases {
		t.Run(string(c.name), func(t *testing.T) {
			err := ValidateStruct(c.value)
			valid := err == nil
			if valid != c.valid {
				t.Errorf("Expected %t but got %t", c.valid, valid)
			}
		})
	}
}

func Test_ValidateUUID(t *testing.T) {
	cases := []struct {
		name  string
		value string
		valid bool
	}{
		{
			name:  "Valid ID",
			value: "d6c1ea55-dbcb-4ab9-a2a1-363298c29b53",
			valid: true,
		},
		{
			name:  "Invalid Format",
			value: "01234",
			valid: false,
		},
		{
			name:  "Invalid Format, too long",
			value: "d6c1ea55-dbcb-4ab9-a2a1-363298c29b531",
			valid: false,
		},
		{
			name:  "Invalid Format, no dashes",
			value: "d6c1ea55dbcb4ab9a2a1363298c29b53",
			valid: false,
		},
		{
			name:  "Empty string uuid passed in",
			value: "",
			valid: false,
		},
	}

	for _, c := range cases {
		t.Run(string(c.name), func(t *testing.T) {
			err := ValidateUUID(c.value)
			valid := err == nil
			if valid != c.valid {
				t.Errorf("Expected %t but got %t", c.valid, valid)
			}
		})
	}
}
