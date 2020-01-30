package httputil

import (
	"context"
	"testing"
)

func TestAuthenticatedIDs(t *testing.T) {
	// make sure we can get and set
	userID := "padme"
	brandID := "naboo"
	ctx := context.Background()
	ctx = SetAuthenticatedIDs(ctx, userID, brandID)

	returnedUserID, returnedBrandID, err := GetAuthenticatedIDs(ctx)
	if err != nil {
		t.Errorf("TestAuthenticatedIDs got an unexpected error")
	}
	if returnedUserID != userID {
		t.Errorf("TestAuthenticatedIDs expected userID to be \"%s\" but got \"%s\"", userID, returnedUserID)
	}
	if returnedBrandID != brandID {
		t.Errorf("TestAuthenticatedIDs expected brandID to be \"%s\" but got \"%s\"", brandID, returnedBrandID)
	}

	ctx = context.Background()
	_, _, err = GetAuthenticatedIDs(ctx)
	if err == nil {
		t.Errorf("TestAuthenticatedIDs expected error getting ids from empty context")
	}

}
