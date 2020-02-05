package store

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

type Item struct {
	ID            primitive.ObjectID `json:"id" bson:"_id"`
	UserID        primitive.ObjectID `json:"userId" bson:"userId"`
	Text          string             `json:"text" bson:"text"`
	DateCreated   time.Time          `json:"dateCreated" bson:"dateCreated"`
	DateCompleted time.Time          `json:"dateCompleted" bson:"dateCompleted"`
}

func (s *MongoStore) SaveItem(userID primitive.ObjectID, text string) (Item, error) {
	collection := s.client.Database("checkit").Collection("items")
	item := Item{
		ID:            primitive.NewObjectID(),
		UserID:        userID,
		Text:          text,
		DateCreated:   time.Now(),
		DateCompleted: time.Time{},
	}
	_, err := collection.InsertOne(context.TODO(), item)
	if err != nil {
		return Item{}, err
	}
	return item, nil
}

func (s *MongoStore) GetItemsForUser(userID primitive.ObjectID) ([]Item, error) {
	collection := s.client.Database("checkit").Collection("items")
	filter := bson.D{{"userId", bson.D{{"$eq", userID}}}}
	findOptions := options.Find().SetSort(bson.D{{"dateCreated", -1}})
	cursor, err := collection.Find(context.TODO(), filter, findOptions)
	if err != nil {
		return nil, err
	}

	var items []Item
	for cursor.Next(context.TODO()) {
		var item Item
		err := cursor.Decode(&item)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	cursor.Close(context.TODO())

	return items, nil
}
