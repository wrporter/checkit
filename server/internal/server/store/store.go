package store

import (
	"context"
	"fmt"
	env2 "github.com/wrporter/checkit/server/internal/lib/env"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Store interface {
	SaveUser(ctx context.Context, user User) (*User, error)
	DeleteUser(ctx context.Context, userID string) error
	GetUser(ctx context.Context, userID string) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)

	SaveItem(ctx context.Context, userID string, text string) (Item, error)
	GetItemsForUser(ctx context.Context, userID string) ([]Item, error)
	UpdateItemStatus(ctx context.Context, userID string, itemID string, status ItemStatus) error
	DeleteItems(ctx context.Context, userID string) error
	DeleteCompletedItems(ctx context.Context, userID string) error
}

type MongoStore struct {
	client *mongo.Client
}

func New() Store {
	clientOptions := options.Client().ApplyURI(fmt.Sprintf("mongodb://%s:27017", env2.MongoHost))
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		env2.RequireNoErr(err)
	}
	return &MongoStore{client}
}
