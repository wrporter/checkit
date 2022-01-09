package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"github.com/gin-gonic/gin"
	env2 "github.com/wrporter/checkit/server/internal/lib/env"
	"github.com/wrporter/checkit/server/internal/lib/gin/ginzap"
	httputil2 "github.com/wrporter/checkit/server/internal/lib/httputil"
	"github.com/wrporter/checkit/server/internal/lib/log"
	"github.com/wrporter/checkit/server/internal/lib/session"
	"github.com/wrporter/checkit/server/internal/server/store"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"io/ioutil"
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
		ClientID:     env2.RequireEnv("GOOGLE_OAUTH_CLIENT_ID"),
		ClientSecret: env2.RequireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
		RedirectURL:  env2.SiteURL() + "/api/auth/oauth/google",
		Scopes:       []string{"email", "profile"},
		Endpoint:     google.Endpoint,
	}
)

const oauthGoogleAPIURL = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="

func HandleGoogleLogin(c *gin.Context) {
	state := setOAuthStateCookie(c.Writer, c.Param("method"))
	u := oauthGoogleConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, u)
}

func GoogleCallback(s store.Store, sessionManager *session.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		stateCookie, _ := c.Cookie("oauthstate")
		stateParam := c.Query("state")
		if stateParam != stateCookie {
			log.SC(c.Request.Context()).Errorf("Invalid OAuth state, expected %s, got %s", stateCookie, stateParam)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		//log.SC(c.Request.Context()).Infof("State: %s", stateParam)
		state := OAuthState{}
		decoded, err := base64.URLEncoding.DecodeString(stateParam)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to decode OAuth state: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}
		err = json.Unmarshal(decoded, &state)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to unmarshal OAuth state: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}
		//log.SC(c.Request.Context()).Infof("OAuth state: %+v", state)

		code := c.Query("code")
		if code == "" {
			log.SC(c.Request.Context()).Errorf("Code not found")
			if c.Query("error_reason") == "user_denied" {
				log.SC(c.Request.Context()).Errorf("User has denied permission")
			}
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		token, err := oauthGoogleConfig.Exchange(context.Background(), code)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Google OAuth exchanged failed: %v", err)
			return
		}

		response, err := http.Get(oauthGoogleAPIURL + url.QueryEscape(token.AccessToken))
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to get user info: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}
		defer response.Body.Close()

		body, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to read response body: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "/")
			return
		}

		var profile OAuthProfile
		err = json.Unmarshal(body, &profile)
		if err != nil {
			log.SC(c.Request.Context()).Errorf("Failed to unmarshal response body: %v", err)
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

func login(c *gin.Context, s store.Store, profile OAuthProfile, sessionManager *session.Manager) {
	u, err := s.GetUserByEmail(c.Request.Context(), profile.Email)
	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusUnauthorized, httputil2.ToHTTPError(http.StatusUnauthorized, "Invalid credentials"))
		return
	} else if err != nil {
		log.SC(c.Request.Context()).Errorf("Failed to get user from database: %s", err.Error())
		httputil2.RespondWithError(c.Writer, c.Request, httputil2.ErrHTTPInternalServerError("Failed to login"))
		return
	}

	if !u.SocialProviders["google"] {
		c.JSON(http.StatusUnauthorized, httputil2.ToHTTPError(http.StatusUnauthorized, "TODO: Allow linking social accounts"))
		return
	}

	log.SC(c.Request.Context()).Infof("User logged in: %s", u.ID.Hex())
	sessionManager.Put(c.Request.Context(), session.User{ID: u.ID.Hex()})
	ginzap.AddUserID(c, u.ID.Hex())
	c.Redirect(http.StatusTemporaryRedirect, "/")
}

func signup(c *gin.Context, s store.Store, profile OAuthProfile, sessionManager *session.Manager) {
	u, err := s.GetUserByEmail(c.Request.Context(), profile.Email)
	if u != nil {
		log.SC(c.Request.Context()).Errorf("Failed signup for user that already exists: %s", u.ID.Hex())
		httputil2.RespondWithError(c.Writer, c.Request, httputil2.ErrHTTPBadRequest("Invalid credentials"))
		return
	} else if err != nil && err != mongo.ErrNoDocuments {
		log.SC(c.Request.Context()).Errorf("Failed to get user from database: %s", err.Error())
		httputil2.RespondWithError(c.Writer, c.Request, httputil2.ErrHTTPInternalServerError("Internal server error"))
		return
	}

	u, err = s.SaveUser(c.Request.Context(), store.User{
		ImageURL:        profile.Picture,
		Email:           profile.Email,
		DisplayName:     profile.Name,
		SocialProviders: map[string]bool{"google": true},
	})
	if err != nil {
		httputil2.RespondWithError(c.Writer, c.Request, httputil2.ErrHTTPInternalServerError(err.Error()))
		return
	}

	log.SC(c.Request.Context()).Infof("User signed up: %s", u.ID.Hex())
	sessionManager.Put(c.Request.Context(), session.User{ID: u.ID.Hex()})
	ginzap.AddUserID(c, u.ID.Hex())
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
		Domain:  env2.SiteHost,
		Path:    "/",
		//SameSite: http.SameSiteStrictMode, // TODO: Why doesn't strict mode work? Is it because of the OAuth redirect?
		Secure:   true,
		HttpOnly: true,
	}

	http.SetCookie(w, cookie)
	return stateString
}
