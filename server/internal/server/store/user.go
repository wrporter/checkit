package store

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type User struct {
	ID              primitive.ObjectID `json:"id" bson:"_id"`
	ImageURL        string             `json:"imageUrl" bson:"imageUrl"`
	Image           string             `json:"image" bson:"image"`
	DisplayName     string             `json:"displayName" bson:"displayName"`
	Email           string             `json:"email" bson:"email"`
	Password        string             `json:"password" bson:"password"`
	SocialProviders map[string]bool    `json:"socialProviders" bson:"socialProviders"`
	CreatedAt       time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt" bson:"updatedAt"`
}

func (s *MongoStore) GetUser(ctx context.Context, userID string) (*User, error) {
	collection := s.client.Database("checkit").Collection("users")

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	filter := bson.D{{"_id", bson.D{{"$eq", uid}}}}
	result := collection.FindOne(ctx, filter)

	var user User
	err = result.Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *MongoStore) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	collection := s.client.Database("checkit").Collection("users")
	filter := bson.D{{"email", bson.D{{"$eq", email}}}}
	result := collection.FindOne(ctx, filter)

	var user User
	err := result.Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *MongoStore) SaveUser(ctx context.Context, user User) (*User, error) {
	(&user).ID = primitive.NewObjectID()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	collection := s.client.Database("checkit").Collection("users")
	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *MongoStore) DeleteUser(ctx context.Context, userID string) error {
	db := s.client.Database("checkit")

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	_, err = db.Collection("items").DeleteMany(ctx, bson.D{{"userId", bson.D{{"$eq", uid}}}})
	if err != nil {
		return err
	}

	_, err = db.Collection("users").DeleteOne(ctx, bson.D{{"_id", bson.D{{"$eq", uid}}}})
	if err != nil {
		return err
	}

	return nil
}
