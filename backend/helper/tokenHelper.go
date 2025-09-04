package helper

import (
	"log"
	"os"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	jwtKey []byte
	once   sync.Once
)

func getJWTKey() []byte {
	once.Do(func() {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			log.Println("⚠️ Warning: JWT_SECRET environment variable is not set. Using default insecure key for development.")
			secret = "default_insecure_key_deployment_jwt_secret"
		}
		jwtKey = []byte(secret)
		log.Println("JWT key initialized successfully")
	})
	return jwtKey
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

func GenerateJWT(userID primitive.ObjectID) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userID.Hex(),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTKey())
}

func ValidateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return getJWTKey(), nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}
