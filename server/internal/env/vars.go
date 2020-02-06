package env

import "fmt"

var (
	AppHost   = DefaultEnv("APP_HOST", "localhost")
	AppPort   = DefaultEnv("APP_PORT", "9000")
	SiteHost  = DefaultEnv("SITE_HOST", "localhost")
	MongoHost = DefaultEnv("MONGO_HOST", "localhost")
)

func AppDomain() string {
	return fmt.Sprintf("%s:%s", AppHost, AppPort)
}
