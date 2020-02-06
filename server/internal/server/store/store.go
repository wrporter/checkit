package store

import (
	"context"
	"github.com/wrporter/games-app/server/internal/env"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Store interface {
	SaveUser(user User) (primitive.ObjectID, error)
	GetUserByEmail(email string) (User, error)

	SaveItem(userID primitive.ObjectID, text string) (Item, error)
	GetItemsForUser(userID primitive.ObjectID) ([]Item, error)
	UpdateItemStatus(userID primitive.ObjectID, itemID string, status ItemStatus) error
}

type MongoStore struct {
	client *mongo.Client
}

func New() Store {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		env.RequireNoErr(err)
	}
	return &MongoStore{client}
}
