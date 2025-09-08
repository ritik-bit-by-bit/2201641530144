# Frontend Application Guide

## Overview

The frontend is a React TypeScript application built with Vite and Material UI, providing a user-friendly interface for the URL shortener service.

## Features

### URL Shortener Page
- Create up to 5 URLs simultaneously
- Custom validity periods (1-525600 minutes)
- Optional custom shortcodes
- Real-time validation
- Copy-to-clipboard functionality
- Responsive design

### Statistics Page
- View all created URLs
- Detailed click analytics
- Real-time statistics updates
- Expandable accordion layout
- Click details table with timestamps, referrers, and locations

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material UI** - Component library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS styling

## Component Structure

```
src/
├── components/
│   ├── UrlShortener.tsx    # Main URL creation form
│   └── UrlStatistics.tsx   # Statistics display
├── services/
│   └── api.ts             # API client
├── types/
│   └── index.ts           # TypeScript interfaces
└── App.tsx                # Main application
```

## Key Components

### UrlShortener
- Dynamic form for multiple URL creation
- Client-side validation
- Error handling and display
- Results display with copy functionality

### UrlStatistics
- Accordion-based layout for multiple URLs
- Real-time statistics fetching
- Detailed click information table
- Status indicators (active/expireED)


## API Integration

The frontend communicates with the backend through a centralized API service:

```typescript
// Create short URL
const response = await urlShortenerApi.createShortUrl({
  url: "https://example.com",
  validity: 30,
  shortcode: "custom123"
});

// Get statistics
const stats = await urlShortenerApi.getStats("custom123");
```

## Styling

- **Material UI Theme** - Consistent design system
- **Responsive Layout** - Mobile and desktop optimized
- **Custom Components** - Enhanced Material UI components
- **Clean Design** - Uncluttered, professional appearance

## State Management

- **Local State** - React hooks for component state
- **Props Drilling** - Simple data flow between components
- **Session Storage** - Persist created URLs across page refreshes

## Error Handling

- **API Errors** - Displayed in user-friendly alerts
- **Validation Errors** - Real-time form validation
- **Network Errors** - Graceful fallback messages

## Performance

- **Lazy Loading** - Components loaded as needed
- **Memoization** - Optimized re-renders
- **Efficient API Calls** - Minimal unnecessary requests

## Browser Support

- Modern browsers with ES2020 support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Development Server
- Runs on `http://localhost:3000`
- Hot module replacement
- TypeScript compilation
- ESLint integration

## Production Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

## Testing

Manual testing scenarios:
1. Create single URL with default settings
2. Create multiple URLs with custom settings
3. Test validation with invalid inputs
4. View statistics and click tracking
5. Test responsive design on different screen sizes
