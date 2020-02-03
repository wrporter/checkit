package auth

import (
	"context"
)

type (
	ctxKeyType string
	User       struct {
		Email      string `json:"email"`
		Name       string `json:"name"`
		GivenName  string `json:"given_name"`
		FamilyName string `json:"family_name"`
		Picture    string `json:"picture"`
	}
)

const ContextKey = "session.context"

func UserFromContext(c context.Context) (User, bool) {
	v, ok := c.Value(ContextKey).(User)
	if !ok {
		return User{}, false
	}
	return v, true
}
