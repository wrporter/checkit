package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"github.com/alexedwards/scs/v2"
	"github.com/gin-gonic/gin"
	"github.com/wrporter/games-app/server/internal/env"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"github.com/wrporter/games-app/server/internal/server/session"
	"github.com/wrporter/games-app/server/internal/server/store"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"time"
)

type (
	OAuthState struct {
		Method string `json:"method,omitempty"`
		State  string `json:"state,omitempty"`
	}
	OAuthProfile struct {
		Email   string `json:"email,omitempty"`
		Name    string `json:"name,omitempty"`
		Picture string `json:"picture,omitempty"`
	}
)

var (
	oauthGoogleConfig = &oauth2.Config{
		ClientID:     env.RequireEnv("GOOGLE_OAUTH_CLIENT_ID"),
		ClientSecret: env.RequireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
		RedirectURL:  env.SiteURL() + "/api/auth/oauth/google",
		Scopes:       []string{"email", "profile"},
		Endpoint:     google.Endpoint,
	}
)

const oauthGoogleAPIURL = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="

func HandleGoogleLogin(c *gin.Context) {
	state := setOAuthStateCookie(c.Writer, c.Param("method"))
	//c.SetCookie("oauthstate", state, int((20 * time.Minute).Seconds()), "/", env.SiteHost, true, true)
	u := oauthGoogleConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, u)
}

func GoogleCallback(s store.Store, sessionManager *scs.SessionManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		stateCookie, _ := c.Cookie("oauthstate")
		stateParam := c.Query("state")
		if stateParam != stateCookie {
			log.Printf("Invalid OAuth state, expected %s, got %s\n", stateCookie, stateParam)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		//log.Printf("State: %s\n", stateParam)
		state := OAuthState{}
		decoded, err := base64.URLEncoding.DecodeString(stateParam)
		if err != nil {
			log.Printf("Failed to decode OAuth state: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}
		err = json.Unmarshal(decoded, &state)
		if err != nil {
			log.Printf("Failed to unmarshal OAuth state: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}
		//log.Printf("OAuth state: %+v\n", state)

		code := c.Query("code")
		if code == "" {
			log.Printf("Code not found\n")
			if c.Query("error_reason") == "user_denied" {
				log.Printf("User has denied permission\n")
			}
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		token, err := oauthGoogleConfig.Exchange(context.Background(), code)
		if err != nil {
			log.Printf("Google OAuth exchanged failed: %v\n", err)
			return
		}

		response, err := http.Get(oauthGoogleAPIURL + url.QueryEscape(token.AccessToken))
		if err != nil {
			log.Printf("Failed to get user info: %v\n", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}
		defer response.Body.Close()

		body, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Printf("Failed to read response body: %v\n", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		var profile OAuthProfile
		err = json.Unmarshal(body, &profile)
		if err != nil {
			log.Printf("Failed to unmarshal response body: %v\n", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		if state.Method == "login" {
			login(c, s, profile, sessionManager)
		} else if state.Method == "signup" {
			signup(c, s, profile, sessionManager)
		}
	}
}

func login(c *gin.Context, s store.Store, profile OAuthProfile, sessionManager *scs.SessionManager) {
	u, err := s.GetUserByEmail(c.Request.Context(), profile.Email)
	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusUnauthorized, httputil.ToHTTPError(http.StatusUnauthorized, "Invalid credentials"))
		return
	} else if err != nil {
		log.Printf("Failed to get user from database: %s\n", err.Error())
		httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError("Failed to login"))
		return
	}

	if !u.SocialProviders["google"] {
		c.JSON(http.StatusUnauthorized, httputil.ToHTTPError(http.StatusUnauthorized, "TODO: Allow linking social accounts"))
		return
	}

	log.Printf("User logged in - %s\n", u.ID.Hex())
	sessionManager.Put(c.Request.Context(), session.ContextKey, u)
	c.Redirect(http.StatusTemporaryRedirect, "/")
}

func signup(c *gin.Context, s store.Store, profile OAuthProfile, sessionManager *scs.SessionManager) {
	u, err := s.GetUserByEmail(c.Request.Context(), profile.Email)
	if u != nil {
		log.Printf("Failed signup for user that already exists: %s\n", u.ID.Hex())
		httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPBadRequest("Invalid credentials"))
		return
	} else if err != nil && err != mongo.ErrNoDocuments {
		log.Printf("Failed to get user from database: %s\n", err.Error())
		httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError("Internal server error"))
		return
	}

	u, err = s.SaveUser(c.Request.Context(), store.User{
		ImageURL:        profile.Picture,
		Email:           profile.Email,
		DisplayName:     profile.Name,
		SocialProviders: map[string]bool{"google": true},
	})
	if err != nil {
		httputil.RespondWithError(c.Writer, c.Request, httputil.ErrHTTPInternalServerError(err.Error()))
		return
	}

	log.Printf("User signed up - %s\n", u.ID.Hex())
	sessionManager.Put(c.Request.Context(), session.ContextKey, u)
	c.Redirect(http.StatusTemporaryRedirect, "/")
}

func setOAuthStateCookie(w http.ResponseWriter, method string) string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)

	state := OAuthState{
		Method: method,
		State:  base64.URLEncoding.EncodeToString(b),
	}
	stateJSON, _ := json.Marshal(state)
	stateString := base64.URLEncoding.EncodeToString(stateJSON)

	cookie := &http.Cookie{
		Name:    "oauthstate",
		Value:   stateString,
		Expires: time.Now().Add(20 * time.Minute),
		Domain:  env.SiteHost,
		Path:    "/",
		//SameSite: http.SameSiteStrictMode, // TODO: Why doesn't strict mode work? Is it because of the OAuth redirect?
		Secure:   true,
		HttpOnly: true,
	}

	http.SetCookie(w, cookie)
	return stateString
}
