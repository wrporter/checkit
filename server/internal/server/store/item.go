package store

import (
	"context"
	"errors"
	"github.com/go-playground/validator/v10"
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

func ValidateItemStatus(fl validator.FieldLevel) bool {
	value := ItemStatus(fl.Field().String())
	switch value {
	case ItemStatusComplete, ItemStatusIncomplete:
		return true
	}
	return false
}

func (s *MongoStore) SaveItem(ctx context.Context, userID string, text string) (Item, error) {
	collection := s.client.Database("checkit").Collection("items")
	dateCreated := time.Now()

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return Item{}, err
	}

	item := Item{
		ID:            primitive.NewObjectID(),
		UserID:        uid,
		Text:          text,
		DateCreated:   &dateCreated,
		DateCompleted: nil,
	}
	_, err = collection.InsertOne(ctx, item)
	if err != nil {
		return Item{}, err
	}
	return item, nil
}

func (s *MongoStore) GetItemsForUser(ctx context.Context, userID string) ([]Item, error) {
	collection := s.client.Database("checkit").Collection("items")

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	filter := bson.D{{"userId", bson.D{{"$eq", uid}}}}
	findOptions := options.Find().SetSort(bson.D{{"dateCreated", -1}})
	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}

	var items []Item
	for cursor.Next(ctx) {
		var item Item
		err = cursor.Decode(&item)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	if err = cursor.Err(); err != nil {
		return nil, err
	}

	cursor.Close(ctx)

	return items, nil
}

func (s *MongoStore) UpdateItemStatus(ctx context.Context, userID string, itemID string, status ItemStatus) error {
	collection := s.client.Database("checkit").Collection("items")

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	oid, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		return err
	}
	filter := bson.M{
		"_id":    oid,
		"userId": uid,
	}

	var dateCompleted *time.Time
	now := time.Now()
	if status == ItemStatusComplete {
		dateCompleted = &now
	}
	update := bson.M{"$set": bson.M{"dateCompleted": dateCompleted}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount != 1 {
		return ErrNotFound
	}
	return nil
}

func (s *MongoStore) DeleteItems(ctx context.Context, userID string) error {
	collection := s.client.Database("checkit").Collection("items")

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	_, err = collection.DeleteMany(ctx, bson.M{"userId": uid})
	return err
}

func (s *MongoStore) DeleteCompletedItems(ctx context.Context, userID string) error {
	collection := s.client.Database("checkit").Collection("items")

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	_, err = collection.DeleteMany(ctx, bson.M{"userId": uid, "dateCompleted": bson.M{"$ne": nil}})
	return err
}
