package store

import (
	"context"
	"errors"
	"github.com/go-playground/validator/v10"
	"github.com/wrporter/games-app/server/internal/server/httputil"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

const (
	ItemStatusComplete   ItemStatus = "Complete"
	ItemStatusIncomplete ItemStatus = "Incomplete"
)

var ErrNotFound = errors.New("not found")

type (
	ItemStatus string
	Item       struct {
		ID            primitive.ObjectID `json:"id" bson:"_id"`
		UserID        primitive.ObjectID `json:"userId" bson:"userId"`
		Text          string             `json:"text" bson:"text"`
		DateCreated   *time.Time         `json:"dateCreated" bson:"dateCreated,omitempty"`
		DateCompleted *time.Time         `json:"dateCompleted" bson:"dateCompleted,omitempty"`
	}
)

func init() {
	httputil.RegisterValidator("itemStatus", validateItemStatus, "{0} must be a valid status")
}

func validateItemStatus(fl validator.FieldLevel) bool {
	value := ItemStatus(fl.Field().String())
	switch value {
	case ItemStatusComplete, ItemStatusIncomplete:
		return true
	}
	return false
}

func (s *MongoStore) SaveItem(userID primitive.ObjectID, text string) (Item, error) {
	collection := s.client.Database("checkit").Collection("items")
	dateCreated := time.Now()
	item := Item{
		ID:            primitive.NewObjectID(),
		UserID:        userID,
		Text:          text,
		DateCreated:   &dateCreated,
		DateCompleted: nil,
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

func (s *MongoStore) UpdateItemStatus(userID primitive.ObjectID, itemID string, status ItemStatus) error {
	collection := s.client.Database("checkit").Collection("items")

	oid, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		return err
	}
	filter := bson.M{
		"_id":    oid,
		"userId": userID,
	}

	var dateCompleted *time.Time
	now := time.Now()
	if status == ItemStatusComplete {
		dateCompleted = &now
	}
	update := bson.M{"$set": bson.M{"dateCompleted": dateCompleted}}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount != 1 {
		return ErrNotFound
	}
	return nil
}
