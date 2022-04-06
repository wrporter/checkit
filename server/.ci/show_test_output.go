package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func main() {
	dec := json.NewDecoder(os.Stdin)
	var thing struct{ Output string }
	var err error
	var str string
	for err == nil {
		if err, str = dec.Decode(&thing), strings.TrimSpace(thing.Output); err == nil && str != "" {
			_, _ = fmt.Fprintln(os.Stdout, str)
		}
	}
}
