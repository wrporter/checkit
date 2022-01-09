package session

import "sync"

type hub struct {
	Register   chan *Client
	Unregister chan string
	clients    map[string]*Client
	broadcast  chan string
	mu         sync.Mutex
}

func newHub() *hub {
	return &hub{
		clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan string),
		broadcast:  make(chan string),
	}
}

func (h *hub) run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.clients[client.Token] = client
			h.mu.Unlock()
		case token := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.clients[token]; ok {
				delete(h.clients, token)
			}
			h.mu.Unlock()
		case token := <-h.broadcast:
			h.mu.Lock()
			if _, ok := h.clients[token]; ok {
				h.clients[token].Delete <- true
			}
			h.mu.Unlock()
		}
	}
}
