# URL Shortener Backend

This is the backend API for the URL Shortener application. It provides endpoints for creating, retrieving, and managing shortened URLs, as well as tracking analytics.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/url-shortener
PORT=5000
```

Replace the MongoDB URI with your own connection string if needed.

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts when changes are detected.

### Production Mode

First, build the TypeScript code:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## API Endpoints

- `POST /api/urls` - Create a new shortened URL
- `GET /api/urls/:shortCode` - Get URL data by short code
- `GET /api/urls/:shortCode/redirect` - Redirect to original URL (and record click)
- `GET /api/urls/:shortCode/analytics` - Get analytics for a URL
- `PUT /api/urls/:shortCode/deactivate` - Deactivate a URL

## Request/Response Examples

### Create a new shortened URL

**Request:**

```json
POST /api/urls
{
  "originalUrl": "https://example.com/very/long/url",
  "customAlias": "mylink",
  "expiresAt": "2023-12-31T23:59:59Z"
}
```

**Response:**

```json
{
  "_id": "60f7b0b3e6b3a1234567890a",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "mylink",
  "customAlias": "mylink",
  "createdAt": "2023-07-21T12:34:56.789Z",
  "expiresAt": "2023-12-31T23:59:59.000Z",
  "clicks": 0,
  "isActive": true,
  "clickHistory": []
}
```

## Database Schema

The application uses MongoDB with the following schema for URLs:

- `originalUrl` (String, required) - The original long URL
- `shortUrl` (String, required, unique) - The shortened URL code
- `customAlias` (String, optional) - User-provided custom alias
- `createdAt` (Date, default: now) - Creation timestamp
- `expiresAt` (Date, optional) - Expiration timestamp
- `clicks` (Number, default: 0) - Number of clicks
- `isActive` (Boolean, default: true) - Whether the URL is active
- `clickHistory` (Array) - History of clicks with timestamp, referrer, user agent, and IP
