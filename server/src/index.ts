import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import urlRoutes from './routes/urlRoutes';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-render-frontend-url.onrender.com', 'https://your-render-backend-url.onrender.com'] 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/urls', urlRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, '../../project/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../project/dist/index.html'));
  });
} else {
  // Basic route for API check in development
  app.get('/', (_req, res) => {
    res.send('URL Shortener API is running');
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
