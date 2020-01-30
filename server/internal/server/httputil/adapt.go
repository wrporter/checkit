package httputil

import "github.com/julienschmidt/httprouter"

// Adapter pattern for cleanly extending HTTP handlers.
type Adapter func(httprouter.Handle) httprouter.Handle

func Adapt(handle httprouter.Handle, adapters ...Adapter) httprouter.Handle {
	for i := len(adapters) - 1; i >= 0; i-- {
		handle = adapters[i](handle)
	}
	return handle
}
