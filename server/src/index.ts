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
    ? '*' 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/urls', urlRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;

// Debug directory structure
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// List all directories and files in the current directory
try {
  const currentDir = process.cwd();
  console.log(`\nListing files in ${currentDir}:`);
  const files = fs.readdirSync(currentDir);
  files.forEach(file => {
    const filePath = path.join(currentDir, file);
    const stats = fs.statSync(filePath);
    console.log(`${file} - ${stats.isDirectory() ? 'Directory' : 'File'}`);
  });
} catch (error) {
  console.error('Error listing files:', error);
}

// Check for the dist directory
const distDir = path.join(process.cwd(), 'dist');
console.log(`\nChecking for dist directory: ${distDir}`);
if (fs.existsSync(distDir)) {
  console.log('dist directory exists');
  try {
    const distFiles = fs.readdirSync(distDir);
    console.log('Files in dist directory:', distFiles);
  } catch (error) {
    console.error('Error reading dist directory:', error);
  }
} else {
  console.log('dist directory does not exist');
}

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible locations for the frontend files
  const possiblePaths = [
    path.join(__dirname, '../public'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'dist/public'),
    path.join(process.cwd(), '../project/dist'),
    path.join(__dirname, '../../project/dist')
  ];
  
  let frontendPath = null;
  
  // Find the first path that exists
  for (const testPath of possiblePaths) {
    console.log(`Checking for frontend at: ${testPath}`);
    if (fs.existsSync(testPath)) {
      console.log(`Frontend found at: ${testPath}`);
      frontendPath = testPath;
      break;
    }
  }
  
  if (frontendPath) {
    // Serve static files from the frontend build
    app.use(express.static(frontendPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        // Skip API routes
        return;
      }
      const indexPath = path.join(frontendPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`Index.html not found at: ${indexPath}`);
        res.status(404).send('Frontend not built correctly');
      }
    });
  } else {
    console.error('Frontend directory not found in any of the expected locations');
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
