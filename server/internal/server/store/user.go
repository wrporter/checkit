package store

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID         primitive.ObjectID `json:"id" bson:"_id"`
	ImageURL   string             `json:"imageUrl" bson:"imageUrl"`
	Email      string             `json:"email" bson:"email"`
	Name       string             `json:"name" bson:"name"`
	GivenName  string             `json:"givenName" bson:"givenName"`
	FamilyName string             `json:"familyName" bson:"familyName"`
}

func (s *MongoStore) GetUserByEmail(email string) (User, error) {
	collection := s.client.Database("checkit").Collection("users")
	filter := bson.D{{"email", bson.D{{"$eq", email}}}}
	result := collection.FindOne(context.TODO(), filter)

	var user User
	err := result.Decode(&user)
	if err != nil {
		return User{}, err
	}

	return user, nil
}

func (s *MongoStore) SaveUser(user User) (primitive.ObjectID, error) {
	(&user).ID = primitive.NewObjectID()
	collection := s.client.Database("checkit").Collection("users")
	result, err := collection.InsertOne(context.TODO(), user)
	if err != nil {
		return primitive.ObjectID{}, err
	}
	return result.InsertedID.(primitive.ObjectID), nil
}
