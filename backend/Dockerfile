# ==========================================
# MULTI-STAGE DOCKERFILE FOR MITRENO GO BACKEND
# Target Deployment: Google Cloud Run / Docker
# ==========================================

# Stage 1: Build binary
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git and ssl certs
RUN apk update && apk add --no-cache git ca-certificates tzdata

# Cache dependencies
COPY go.mod go.sum* ./
RUN go mod download || true

# Copy source code
COPY . .

# Compile optimized static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /bin/mitreno-api ./cmd/api/main.go

# Stage 2: Minimal scratch/alpine runtime
FROM alpine:3.19

WORKDIR /app

# Add ca-certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Copy compiled binary from builder
COPY --from=builder /bin/mitreno-api /app/mitreno-api
COPY --from=builder /app/migrations /app/migrations

# Expose server port
EXPOSE 8080

# Environment defaults
ENV PORT=8080
ENV ENV=production

# Run binary
CMD ["/app/mitreno-api"]
