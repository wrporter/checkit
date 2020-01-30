package auth

import (
	"context"
	"encoding/json"
	"github.com/coreos/go-oidc"
	"github.com/julienschmidt/httprouter"
	"github.com/wrporter/games-app/server/internal/env"
	"golang.org/x/oauth2"
	"log"
	"net/http"
)

var (
	clientID     = env.RequireEnv("GOOGLE_OAUTH_CLIENT_ID")
	clientSecret = env.RequireEnv("GOOGLE_OAUTH_CLIENT_SECRET")
)

func RegisterRoutes(router *httprouter.Router) {
	ctx := context.Background()

	provider, err := oidc.NewProvider(ctx, "https://accounts.google.com")
	if err != nil {
		log.Fatal(err)
	}
	oidcConfig := &oidc.Config{
		ClientID: clientID,
	}
	verifier := provider.Verifier(oidcConfig)

	config := oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  "http://localhost:9000/auth/google/callback",
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	state := "foobar" // Don't do this in production.

	router.GET("/auth", Login(config, state))
	router.GET("/auth/google/callback", LoginCallback(config, state, verifier, ctx))
}

func Login(config oauth2.Config, state string) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		http.Redirect(res, req, config.AuthCodeURL(state), http.StatusFound)
	}
}

func LoginCallback(config oauth2.Config, state string, verifier *oidc.IDTokenVerifier, ctx context.Context) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		if req.URL.Query().Get("state") != state {
			http.Error(res, "state did not match", http.StatusBadRequest)
			return
		}

		oauth2Token, err := config.Exchange(ctx, req.URL.Query().Get("code"))
		if err != nil {
			http.Error(res, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
			return
		}
		rawIDToken, ok := oauth2Token.Extra("id_token").(string)
		if !ok {
			http.Error(res, "No id_token field in oauth2 token.", http.StatusInternalServerError)
			return
		}
		idToken, err := verifier.Verify(ctx, rawIDToken)
		if err != nil {
			http.Error(res, "Failed to verify ID Token: "+err.Error(), http.StatusInternalServerError)
			return
		}

		oauth2Token.AccessToken = "*REDACTED*"

		resp := struct {
			OAuth2Token   *oauth2.Token
			IDTokenClaims *json.RawMessage // ID Token payload is just JSON.
		}{oauth2Token, new(json.RawMessage)}

		if err := idToken.Claims(&resp.IDTokenClaims); err != nil {
			http.Error(res, err.Error(), http.StatusInternalServerError)
			return
		}
		data, err := json.MarshalIndent(resp, "", "    ")
		if err != nil {
			http.Error(res, err.Error(), http.StatusInternalServerError)
			return
		}
		res.Write(data)
	}
}
