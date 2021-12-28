# Checkit

I started this project to learn a few things.

- How to securely do social login.
- How to securely manage user sessions.
- How to do the above and serve a single-page application (SPA) with a RESTful backend server.

## Tech

### UI

The UI is built in React, using Material UI for convenient styling and components.

### Backend

The server is written in Golang with MongoDB storage.

## TODO

- Switch from the now-insecure Implicit Grant Flow to the Authorization Code Flow for OpenID Connect.
- Use WebSockets to automatically log the user out of the UI when their session expires.
- Create a chat using WebSockets for users to share tips on productivity.
- Optimize UI assets.
- Support mobile.
- Add ability to delete items.
- Add ability to delete all completed items.
- Add limits of how many items a user can have so someone doesn't take down my server 😆.
- Add rate limiting for requests.

## Deployment

1. Get the OAuth key and secret from the [Google Cloud Platform](https://console.cloud.google.com/apis/credentials?authuser=1&project=test-oauth2-266303&supportedpurview=project)
    - Insert the key and secret into [.ci/docker-compose.yml](.ci/docker-compose.yml)
    - Add the key and secret to your environment under `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`
2. Run `.ci/deploy.sh`
