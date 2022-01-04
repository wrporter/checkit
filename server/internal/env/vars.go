package env

import "fmt"

var (
	AppHost      = DefaultEnv("APP_HOST", "localhost")
	AppPort      = DefaultEnv("APP_PORT", "9000")
	SiteProtocol = DefaultEnv("SITE_PROTOCOL", "http")
	SiteHost     = DefaultEnv("SITE_HOST", "localhost")
	SitePort     = DefaultEnv("SITE_PORT", "9010")
	MongoHost    = DefaultEnv("MONGO_HOST", "localhost")
)

func SiteURL() string {
	return fmt.Sprintf("%s://%s:%s", SiteProtocol, SiteHost, SitePort)
}

func AppDomain() string {
	return fmt.Sprintf("%s:%s", AppHost, AppPort)
}
