package env

import (
	"fmt"
	"github.com/wrporter/checkit/server/internal/lib/log"
	"os"
)

func RequireEnv(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		RequireNoErr(fmt.Errorf("missing required environment variable %s", key))
	}
	return value
}

func DefaultEnv(key string, fallback string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	return value
}

func RequireNoErr(err error) {
	if err != nil {
		log.S().Error(err)
		panic(err)
	}
}
