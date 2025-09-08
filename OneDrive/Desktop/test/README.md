# URL Shortener Microservice

A full-stack URL shortener application built with Node.js/Express backend and React frontend, featuring comprehensive logging, analytics, and Material UI design.

## Project Structure

```
├── backend/                 # Node.js/Express microservice
│   ├── src/
│   │   ├── middleware/      # Custom logging middleware
│   │   ├── models/         # TypeScript interfaces
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main application
│   ├── package.json
│   └── vite.config.ts
└── documentation/          # Project documentation
```

## Features

### Backend API
- **POST /shorturls** - Create shortened URLs with custom validity and shortcodes
- **GET /:shortcode** - Redirect to original URL with click tracking
- **GET /shorturls/:shortcode** - Retrieve detailed statistics
- **GET /health** - Health check endpoint
- Custom logging middleware for comprehensive request/response tracking
- In-memory storage with automatic cleanup of expired URLs
- Robust error handling with appropriate HTTP status codes

### Frontend Application
- **URL Shortener Page** - Create up to 5 URLs simultaneously
- **Statistics Page** - View detailed analytics for created URLs
- Material UI design with responsive layout
- Client-side validation and error handling
- Real-time statistics updates

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "validity": 30,
  "shortcode": "custom123"
}
```

**Response (201 Created):**
```json
{
  "shortLink": "http://localhost:3001/custom123",
  "expiry": "2025-01-01T00:30:00Z"
}
```

### Get Statistics
```http
GET /shorturls/:shortcode
```

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

### Redirect
```http
GET /:shortcode
```

**Response (302 Redirect):** Redirects to the original URL

## Usage

1. **Start both servers** (backend on port 3001, frontend on port 3000)
2. **Open the frontend** at `http://localhost:3000`
3. **Create short URLs** using the URL Shortener tab
4. **View statistics** using the Statistics tab
5. **Test redirects** by clicking on generated short URLs

## Technical Details

### Backend Architecture
- **Express.js** with TypeScript
- **Custom logging middleware** for comprehensive request tracking
- **In-memory storage** with automatic cleanup
- **Input validation** and error handling
- **CORS** enabled for frontend integration

### Frontend Architecture
- **React 18** with TypeScript
- **Material UI** for consistent design
- **Axios** for API communication
- **Vite** for fast development and building
- **Responsive design** for mobile and desktop

### Logging
The application uses a custom logging middleware that tracks:
- Request/response details
- Error information
- Performance metrics
- User interactions

## Development

### Backend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Error Handling

The application includes comprehensive error handling:
- **Validation errors** (400 Bad Request)
- **Resource not found** (404 Not Found)
- **Shortcode conflicts** (409 Conflict)
- **Server errors** (500 Internal Server Error)

## Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Input validation** and sanitization
- **Rate limiting** considerations (can be added)

## Performance

- **In-memory storage** for fast access
- **Automatic cleanup** of expired URLs
- **Efficient shortcode generation**
- **Optimized React components**

## Testing

To test the API endpoints:

1. **Health Check:**
```bash
curl http://localhost:3001/health
```

2. **Create Short URL:**
```bash
curl -X POST http://localhost:3001/shorturls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "validity": 30}'
```

3. **Get Statistics:**
```bash
curl http://localhost:3001/shorturls/{shortcode}
```

## License

This project is developed for evaluation purposes.
