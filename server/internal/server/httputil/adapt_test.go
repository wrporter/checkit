package httputil

import (
	"net/http"
	"sync/atomic"
	"testing"

	"github.com/julienschmidt/httprouter"
)

func TestAdapt(t *testing.T) {
	var numAdapterCalls int32
	mockAdapter := func(handler httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			atomic.AddInt32(&numAdapterCalls, 1)
			handler(writer, request, params)
		}
	}
	handlerCalled := false
	mockHandler := func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		handlerCalled = true
	}

	handler := Adapt(mockHandler, mockAdapter, mockAdapter, mockAdapter)
	handler(nil, nil, nil)
	if handlerCalled == false {
		t.Error("TestAdapt handler not called")
	}
	if numAdapterCalls != 3 {
		t.Errorf("TestAdapt expected adapter to be called 3 time but was called %d times", numAdapterCalls)
	}
}
