package app

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var (
	ServiceName  = ""
	BuildBranch  = ""
	BuildVersion = ""
	BuildDate    = ""
	Info         App
)

type App struct {
	ServiceName  string `json:"serviceName"`
	BuildBranch  string `json:"buildBranch"`
	BuildVersion string `json:"buildVersion"`
	BuildDate    string `json:"buildDate"`
}

func init() {
	Info = App{
		ServiceName:  ServiceName,
		BuildBranch:  BuildBranch,
		BuildVersion: BuildVersion,
		BuildDate:    BuildDate,
	}
}

func VersionHandlerFunc(w http.ResponseWriter, r *http.Request) {
	fmt.Println(ServiceName)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(Info)
}
