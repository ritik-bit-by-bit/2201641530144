# Backend Architecture Documentation

## Overview

The backend is a Node.js microservice built with Express.js and TypeScript, providing RESTful APIs for URL shortening and analytics.

## Architecture

### Core Components

```
src/
├── middleware/
│   └── logger.ts          # Custom logging middleware
├── models/
│   └── types.ts           # TypeScript interfaces
├── routes/
│   ├── shorturls.ts       # API endpoints
│   └── redirect.ts        # Redirect handling
├── services/
│   ├── storage.ts         # In-memory data storage
│   ├── shortcodeGenerator.ts  # Shortcode generation
│   └── urlValidator.ts    # URL validation
└── index.ts               # Application entry point
```

## Key Features

### Custom Logging Middleware
- Comprehensive request/response logging
- Error tracking and debugging
- Performance metrics
- Structured log format

### In-Memory Storage
- Fast data access
- Automatic cleanup of expired URLs
- Thread-safe operations
- Session-based persistence

### Input Validation
- URL format validation
- Shortcode format validation
- Validity period constraints
- Error handling with appropriate HTTP status codes

## API Endpoints

### POST /shorturls
Creates a new shortened URL with validation and storage.

**Flow:**
1. Validate input parameters
2. Check shortcode availability
3. Generate unique shortcode if needed
4. Store URL record
5. Return short link and expiry

### GET /:shortcode
Redirects to original URL and tracks click.

**Flow:**
1. Lookup shortcode in storage
2. Check if URL is expired
3. Record click with metadata
4. Redirect to original URL

### GET /shorturls/:shortcode
Returns detailed statistics for a short URL.

**Flow:**
1. Lookup shortcode in storage
2. Retrieve click data
3. Return formatted statistics

## Data Models

### ShortUrl
```typescript
interface ShortUrl {
  id: string;
  originalUrl: string;
  shortcode: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}
```

### ClickData
```typescript
interface ClickData {
  id: string;
  shortcode: string;
  timestamp: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
}
```

## Security Features

### Helmet.js
- Security headers
- XSS protection
- Content Security Policy
- HTTPS enforcement

### CORS Configuration
- Restricted origins
- Credential support
- Preflight handling

### Input Sanitization
- URL validation
- Shortcode format checking
- Validity period limits

## Performance Optimizations

### In-Memory Storage
- O(1) lookup time
- No database overhead
- Fast data access

### Automatic Cleanup
- Background process removes expired URLs
- Memory management
- Prevents memory leaks

### Efficient Shortcode Generation
- Cryptographically secure random generation
- Collision detection
- Optimized for uniqueness

## Error Handling

### HTTP Status Codes
- 200 OK - Successful requests
- 201 Created - Resource created
- 302 Found - Redirect
- 400 Bad Request - Invalid input
- 404 Not Found - Resource not found
- 409 Conflict - Resource conflict
- 500 Internal Server Error - Server error

### Error Response Format
```typescript
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

## Logging System

### Log Levels
- INFO - General information
- WARN - Warning messages
- ERROR - Error conditions
- DEBUG - Debug information

### Log Structure
```typescript
interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  // Additional context data
}
```

## Development

### Scripts
```bash
npm run dev      # Development server with hot reload
npm run build    # TypeScript compilation
npm start        # Production server
```

### Environment Variables
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Production Considerations

### Scalability
- Horizontal scaling with load balancer
- Database integration for persistence
- Redis for session storage
- Microservice architecture

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Log aggregation

### Security
- Rate limiting
- Authentication/authorization
- Input validation
- HTTPS enforcement

## Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/health

# Create short URL
curl -X POST http://localhost:3001/shorturls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "validity": 30}'

# Get statistics
curl http://localhost:3001/shorturls/{shortcode}
```

### Automated Testing
- Unit tests for services
- Integration tests for endpoints
- Load testing for performance
- Security testing for vulnerabilities
