package session

type Client struct {
	Token  string
	Delete chan bool
}
