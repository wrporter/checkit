package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/wrporter/checkit/server/internal/log"
	"golang.org/x/oauth2"
	"net/http"
	"net/url"
	"strings"
)

func OAuthLogin(oauthConf *oauth2.Config, oauthStateString string) gin.HandlerFunc {
	return func(c *gin.Context) {
		u, err := url.Parse(oauthConf.Endpoint.AuthURL)
		if err != nil {
			log.S().Error("Failed to parse URL: %v\n", err)
		}

		params := url.Values{}
		params.Add("client_id", oauthConf.ClientID)
		params.Add("scope", strings.Join(oauthConf.Scopes, " "))
		params.Add("redirect_uri", oauthConf.RedirectURL)
		params.Add("response_type", "code")
		params.Add("state", oauthStateString)
		u.RawQuery = params.Encode()

		c.Redirect(http.StatusTemporaryRedirect, u.String())
	}
}
