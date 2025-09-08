# API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
No authentication required for this evaluation.

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00Z",
  "uptime": 123.45
}
```

### 2. Create Short URL

**POST** `/shorturls`

Create a new shortened URL.

**Request Body:**
```json
{
  "url": "https://example.com/very-long-url",
  "validity": 30,
  "shortcode": "custom123"
}
```

**Parameters:**
- `url` (string, required): The original URL to shorten
- `validity` (integer, optional): Validity in minutes (default: 30, max: 525600)
- `shortcode` (string, optional): Custom shortcode (3-20 alphanumeric characters)

**Response (201 Created):**
```json
{
  "shortLink": "http://localhost:3001/custom123",
  "expiry": "2025-01-01T00:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `409 Conflict`: Shortcode already exists

### 3. Redirect to Original URL

**GET** `/{shortcode}`

Redirect to the original URL and track the click.

**Parameters:**
- `shortcode` (string): The shortcode to redirect

**Response:**
- `302 Found`: Redirect to original URL
- `404 Not Found`: Shortcode not found or expired

### 4. Get Statistics

**GET** `/shorturls/{shortcode}`

Get detailed statistics for a short URL.

**Parameters:**
- `shortcode` (string): The shortcode to get statistics for

**Response (200 OK):**
```json
{
  "shortcode": "custom123",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2025-01-01T00:00:00Z",
  "expiresAt": "2025-01-01T00:30:00Z",
  "totalClicks": 5,
  "clicks": [
    {
      "id": "uuid",
      "shortcode": "custom123",
      "timestamp": "2025-01-01T00:15:00Z",
      "referrer": "https://google.com",
      "userAgent": "Mozilla/5.0...",
      "ip": "192.168.1.1",
      "country": "Unknown",
      "city": "Unknown"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Shortcode not found or expired

## Error Format

All error responses follow this format:

```json
{
  "error": "ErrorType",
  "message": "Human readable error message",
  "statusCode": 400
}
```

## Rate Limiting

Currently no rate limiting is implemented, but can be added for production use.

## CORS

CORS is enabled for `http://localhost:3000` (frontend URL).
