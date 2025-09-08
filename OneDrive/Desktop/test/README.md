# URL Shortener Microservice

A full-stack URL shortener application built with Node.js/Express backend and React frontend, featuring comprehensive logging, analytics, and Material UI design.

## 🖼️ UI Overview

### Create Short URLs Interface
<img src="[https://via.placeholder.com/800x600/6366f1/ffffff?text=Create+Short+URLs+Interface](https://drive.google.com/file/d/10IgANwXYyiRw2vqA77UW7K4WRJe925Ze/view?usp=sharing)" alt="Create Short URLs Interface" width="800"/>

**Features shown:**
- Bulk URL creation (up to 5 URLs simultaneously)
- Custom validity periods (30 minutes default)
- Optional custom shortcodes
- Add/remove URL fields dynamically
- Clean Material UI design with purple theme

### URL History & Statistics
<img src="https://via.placeholder.com/800x600/8b5cf6/ffffff?text=URL+History+%26+Statistics" alt="URL History and Statistics" width="800"/>

**Features shown:**
- Recent URLs display with click counts
- Expiration status indicators ("Expires Soon")
- Time-based sorting (1m ago, etc.)
- Quick access to detailed statistics
- Visual click tracking with chart icons

### Detailed Analytics Dashboard
<img src="https://via.placeholder.com/800x600/06b6d4/ffffff?text=Detailed+Analytics+Dashboard" alt="Detailed Analytics Dashboard" width="800"/>

**Features shown:**
- Comprehensive click statistics
- Referrer tracking (Direct, Google, etc.)
- Geographic location data
- User agent information
- Timestamp logging with precise timing
- Quick access sidebar for URL navigation

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

## ✨ Features

### 🎯 Core Functionality
- **Bulk URL Creation** - Create up to 5 shortened URLs simultaneously with a single click
- **Custom Validity Periods** - Set expiration times in minutes (default: 30 minutes)
- **Custom Shortcodes** - Optionally specify your own shortcode for branded links
- **Automatic Shortcode Generation** - System generates unique 6-character codes when not specified
- **Real-time Expiration Tracking** - Visual indicators show when URLs are about to expire

### 📊 Advanced Analytics & Tracking
- **Comprehensive Click Statistics** - Track total clicks, last click time, and detailed click history
- **Referrer Tracking** - Monitor where your traffic is coming from (Direct, Google, etc.)
- **Geographic Data** - Location tracking for each click (Country, City)
- **User Agent Analysis** - Detailed browser and device information for each visit
- **Timestamp Logging** - Precise timing of every click with millisecond accuracy

### 🎨 Modern User Interface
- **Clean Material Design** - Professional purple and white color scheme
- **Responsive Layout** - Works seamlessly on desktop and mobile devices
- **Intuitive Navigation** - Easy switching between Create URLs and Statistics views
- **Visual Status Indicators** - Color-coded buttons for expiration status and click counts
- **Quick Access Sidebar** - Fast navigation between different shortened URLs

### 🔧 Backend API Features
- **POST /shorturls** - Create shortened URLs with custom validity and shortcodes
- **GET /:shortcode** - Redirect to original URL with comprehensive click tracking
- **GET /shorturls/:shortcode** - Retrieve detailed statistics and analytics
- **GET /health** - Health check endpoint for monitoring
- **Custom Logging Middleware** - Comprehensive request/response tracking
- **In-memory Storage** - Fast access with automatic cleanup of expired URLs
- **Robust Error Handling** - Appropriate HTTP status codes and error messages

### 📱 Frontend Application Features
- **Multi-URL Management** - Handle multiple URLs in a single interface
- **Real-time Updates** - Statistics refresh automatically as clicks occur
- **Copy-to-Clipboard** - One-click copying of shortened URLs
- **URL Validation** - Client-side validation ensures proper URL format
- **Expiration Warnings** - Visual alerts for URLs nearing expiration
- **Click History Table** - Detailed tabular view of all click events

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
