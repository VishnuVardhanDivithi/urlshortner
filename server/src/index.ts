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
    // Create a simple HTML page as a fallback
    app.get('/', (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LinkShrink URL Shortener</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            .api-section {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            code {
              background-color: #eee;
              padding: 2px 5px;
              border-radius: 3px;
              font-family: monospace;
            }
            .endpoint {
              margin-bottom: 15px;
            }
            .method {
              font-weight: bold;
              color: #3498db;
            }
          </style>
        </head>
        <body>
          <h1>LinkShrink URL Shortener API</h1>
          <p>The API is running successfully, but the frontend is not available.</p>
          
          <div class="api-section">
            <h2>API Endpoints</h2>
            
            <div class="endpoint">
              <p><span class="method">POST</span> <code>/api/urls</code> - Create a new short URL</p>
            </div>
            
            <div class="endpoint">
              <p><span class="method">GET</span> <code>/api/urls/:id</code> - Get details for a specific URL</p>
            </div>
            
            <div class="endpoint">
              <p><span class="method">GET</span> <code>/api/urls</code> - List all URLs</p>
            </div>
            
            <div class="endpoint">
              <p><span class="method">GET</span> <code>/api/analytics/:id</code> - Get analytics for a URL</p>
            </div>
            
            <div class="endpoint">
              <p><span class="method">DELETE</span> <code>/api/urls/:id</code> - Delete a URL</p>
            </div>
          </div>
          
          <p>For more information, please refer to the API documentation.</p>
        </body>
        </html>
      `);
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
