###############################################################################
# Build Binary
###############################################################################
FROM golang:alpine as builder
LABEL maintainer="wesleyrporter@gmail.com"

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main cmd/main.go

###############################################################################
# Build Server
###############################################################################
FROM alpine:latest
LABEL maintainer="wesleyrporter@gmail.com"

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 9000

CMD ["./main"]
