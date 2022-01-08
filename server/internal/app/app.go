package app

import (
	"encoding/json"
	"net/http"
)

var (
	ServiceName  = ""
	BuildBranch  = ""
	BuildVersion = ""
	BuildDate    = ""
	Info         App
)

// App contains build information for an application.
type App struct {
	// ServiceName represents the name of the service.
	ServiceName string `json:"serviceName"`

	// BuildBranch represents the git branch name this version of the
	// application was built on.
	BuildBranch string `json:"buildBranch"`

	// BuildVersion represents the version of the application that is running.
	BuildVersion string `json:"buildVersion"`

	// BuildDate represents the date this version of the application was built.
	BuildDate string `json:"buildDate"`
}

func init() {
	Info = App{
		ServiceName:  ServiceName,
		BuildBranch:  BuildBranch,
		BuildVersion: BuildVersion,
		BuildDate:    BuildDate,
	}
}

// VersionHandlerFunc is an http.HandlerFunc for responding with an
// application's build information.
func VersionHandlerFunc(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(Info)
}
