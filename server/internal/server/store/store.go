package store

import (
	"context"
	"fmt"
	"github.com/wrporter/games-app/server/internal/env"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Store interface {
	SaveUser(ctx context.Context, user User) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)

	SaveItem(ctx context.Context, userID primitive.ObjectID, text string) (Item, error)
	GetItemsForUser(ctx context.Context, userID primitive.ObjectID) ([]Item, error)
	UpdateItemStatus(ctx context.Context, userID primitive.ObjectID, itemID string, status ItemStatus) error
	DeleteCompletedItems(ctx context.Context, userID primitive.ObjectID) error
}

type MongoStore struct {
	client *mongo.Client
}

func New() Store {
	clientOptions := options.Client().ApplyURI(fmt.Sprintf("mongodb://%s:27017", env.MongoHost))
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		env.RequireNoErr(err)
	}
	return &MongoStore{client}
}
