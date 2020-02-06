package env

import "fmt"

var (
	AppHost  = DefaultEnv("APP_HOST", "localhost")
	AppPort  = DefaultEnv("APP_PORT", "9000")
	SiteHost = DefaultEnv("SITE_HOST", "localhost")
	SitePort = DefaultEnv("SITE_PORT", "9010")
)

func AppDomain() string {
	return fmt.Sprintf("%s:%s", AppHost, AppPort)
}

func SiteDomain() string {
	return fmt.Sprintf("%s:%s", SiteHost, SitePort)
}
