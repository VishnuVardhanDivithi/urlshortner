import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import urlRoutes from './routes/urlRoutes';
import path from 'path';
import fs from 'fs';

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
  const distPath = path.join(__dirname, '../public');
  
  // Check if the directory exists
  if (fs.existsSync(distPath)) {
    console.log(`Frontend dist directory found at: ${distPath}`);
    
    // Serve static files from the frontend build
    app.use(express.static(distPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        // Skip API routes
        return;
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`Index.html not found at: ${indexPath}`);
        res.status(404).send('Frontend not built correctly');
      }
    });
  } else {
    console.error(`Frontend dist directory not found at: ${distPath}`);
    app.get('/', (_req, res) => {
      res.send('URL Shortener API is running, but frontend is not available');
    });
  }
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
