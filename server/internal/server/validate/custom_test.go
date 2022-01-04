package validate

import (
	"github.com/go-playground/validator/v10"
	"testing"
)

func Test_qualtricsGUID(t *testing.T) {
	type args struct {
		fl validator.FieldLevel
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{
			name: "Passes for a valid GUID",
			args: args{fl: fieldLevelMock{
				field: "PREFIX_abc0123456789",
				param: "PREFIX",
			}},
			want: true,
		},
		{
			name: "Passes for multiple valid prefixes",
			args: args{fl: fieldLevelMock{
				field: "PREFIX2_abc123456789",
				param: "PREFIX PREFIX2",
			}},
			want: true,
		},
		{
			name: "Failed for an invalid prefix",
			args: args{fl: fieldLevelMock{
				field: "PREFIX2_12345678901",
				param: "PREFIX",
			}},
			want: false,
		},
		{
			name: "Fails for non-string values",
			args: args{fl: fieldLevelMock{
				field: 123,
				param: "PREFIX",
			}},
			want: false,
		},
		{
			name: "Fails for empty strings",
			args: args{fl: fieldLevelMock{
				field: "",
				param: "PREFIX",
			}},
			want: false,
		},
		{
			name: "Fails for invalid IDs after the prefix",
			args: args{fl: fieldLevelMock{
				field: "PREFIX_0",
				param: "PREFIX",
			}},
			want: false,
		},
		{
			name: "Fails when there is no prefix defined",
			args: args{fl: fieldLevelMock{
				field: "PREFIX_12345678901",
				param: "",
			}},
			want: false,
		},
		{
			name: "Passes even if there is a trailing space for the valid prefixes",
			args: args{fl: fieldLevelMock{
				field: "PREFIX_12345678901",
				param: "PREFIX ",
			}},
			want: true,
		},
		{
			name: "Fails for a missing prefix",
			args: args{fl: fieldLevelMock{
				field: "_12345678901",
				param: "PREFIX ",
			}},
			want: false,
		},
		{
			name: "Fails when the matching prefix is whitespace",
			args: args{fl: fieldLevelMock{
				field: "_12345678901",
				param: " ",
			}},
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := qualtricsGUID(tt.args.fl); got != tt.want {
				t.Errorf("qualtricsGUID() = %v, want %v", got, tt.want)
			}
		})
	}
}
