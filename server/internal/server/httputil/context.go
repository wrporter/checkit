package httputil

import (
	"context"
	"net/http"
)

type (
	contextKey string
)

// Keys that are used to store data on the request context
const (
	UserIDKey          contextKey = "userID"
	BrandIDKey         contextKey = "brandID"
	SessionKey         contextKey = "session"
	SessionLanguageKey contextKey = "sessionLanguage"
	RequestBodyKey     contextKey = "requestBody"
	RequestQueryKey    contextKey = "requestQuery"
	AuthType           contextKey = "authType"
)

func GetRequestBody(r *http.Request) interface{} {
	return r.Context().Value(RequestBodyKey)
}

// SetAuthenticatedIDs on the context
func SetAuthenticatedIDs(ctx context.Context, userID, brandID string) context.Context {
	ctx = context.WithValue(ctx, UserIDKey, userID)
	ctx = context.WithValue(ctx, BrandIDKey, brandID)

	return ctx
}

// GetAuthenticatedIDs gets the UserID and BrandID from the context
func GetAuthenticatedIDs(ctx context.Context) (userID string, brandID string, err error) {
	userID, userOk := ctx.Value(UserIDKey).(string)
	brandID, brandOk := ctx.Value(BrandIDKey).(string)
	if !userOk || !brandOk {
		return "", "", ErrMissingAuthenticatedIDs
	}

	return userID, brandID, nil
}
