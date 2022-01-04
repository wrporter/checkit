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
