# Use a base image that includes Go and Alpine

FROM golang:alpine AS builder

# Install dependencies

RUN apk add --no-progress --no-cache gcc musl-dev

# Set the Current Working Directory inside the container

WORKDIR /app

# Copy only app directory

COPY backend ./backend

# Set the working directory to the api directory

WORKDIR /app/backend

# Download dependencies

RUN go mod download

# Build the Go app

RUN go build -tags musl -ldflags '-extldflags "-static"' -o /server .

# Create a new release build stage

FROM alpine:3.18

# Set the working directory to the root directory path

WORKDIR /app

# Copy over the binary built from the previous stage

COPY --from=builder /server /server
COPY --from=builder /app/backend/.env .env
# Expose the port on which the server will run

EXPOSE 3001

# Install curl for healthcheck
RUN apk add --no-cache curl

# # Add healthcheck
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3001/health || exit 1

# Command to run the executable

ENTRYPOINT ["/server"]