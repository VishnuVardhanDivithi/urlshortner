const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const config = require('./config');
const path = require('path');
const { generateBaseUrl } = require('./utils/ipHelper');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGODB_URI = config.database.uri;
const PORT = config.server.port;

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    index: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customAlias: {
    type: String,
    sparse: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + config.urlShortener.expirationDays);
      return date;
    },
    index: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  clickHistory: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      referrer: String,
      userAgent: String,
      ip: String,
      deviceType: String,
      browser: String,
      os: String,
      country: String,
      city: String
    },
  ],
  password: {
    type: String,
    default: null,
  },
  preview: {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
  },
});

// Add methods to the URL schema
urlSchema.methods.getFullShortUrl = function() {
  try {
    console.log('Getting full short URL with base:', config.urlShortener.baseUrl);
    console.log('Short URL:', this.shortUrl);
    return `${config.urlShortener.baseUrl}/${this.shortUrl}`;
  } catch (error) {
    console.error('Error getting full short URL:', error);
    return `http://localhost:5000/${this.shortUrl}`;
  }
};

urlSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Add indexes for better performance
urlSchema.index({ createdAt: 1, isActive: 1 });
urlSchema.index({ shortUrl: 1, isActive: 1 });

const Url = mongoose.model('Url', urlSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  urls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url'
  }]
});

const User = mongoose.model('User', userSchema);

// Generate a random short code
function generateShortCode(length = config.urlShortener.defaultCodeLength) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Extract meaningful keywords from URL
function extractKeywordsFromUrl(url) {
  try {
    // Parse the URL to get hostname and path
    const urlObj = new URL(url);
    
    // Extract domain name without TLD
    const hostname = urlObj.hostname;
    const domainParts = hostname.split('.');
    let domain = domainParts[0];
    if (domain === 'www' && domainParts.length > 1) {
      domain = domainParts[1];
    }
    
    // Extract path segments
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    // Combine domain and significant path segments
    let keywords = [domain];
    if (pathSegments.length > 0) {
      // Add up to 2 path segments if they exist
      keywords = keywords.concat(pathSegments.slice(0, 2));
    }
    
    // Clean up keywords (remove special chars, numbers, etc.)
    keywords = keywords.map(keyword => 
      keyword.replace(/[^a-zA-Z0-9]/g, '')  // Remove non-alphanumeric
             .replace(/^[0-9]+/, '')        // Remove leading numbers
    ).filter(keyword => keyword.length > 0);
    
    return keywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

// Generate a semantic short code based on original URL
function generateSemanticShortCode(originalUrl, minLength = 5, maxLength = 10) {
  // Extract keywords from the URL
  const keywords = extractKeywordsFromUrl(originalUrl);
  
  if (keywords.length === 0) {
    // Fallback to random code if no keywords found
    return generateShortCode(config.urlShortener.defaultCodeLength);
  }
  
  // Create a base for the short code using the first keyword
  let baseCode = keywords[0].toLowerCase().substring(0, 5);
  
  // Add parts of additional keywords if available
  if (keywords.length > 1) {
    for (let i = 1; i < Math.min(keywords.length, 3); i++) {
      if (keywords[i].length > 2) {
        baseCode += keywords[i].substring(0, 2).toLowerCase();
      }
    }
  }
  
  // Ensure minimum length
  if (baseCode.length < minLength) {
    // Add random characters to reach minimum length
    baseCode += generateShortCode(minLength - baseCode.length);
  }
  
  // Trim if longer than maximum length
  if (baseCode.length > maxLength) {
    baseCode = baseCode.substring(0, maxLength);
  }
  
  // Add a random character at the end for uniqueness
  baseCode += Math.floor(Math.random() * 10);
  
  return baseCode;
}

// Create test data
const createTestData = async () => {
  try {
    // Check if we already have test data
    const urlCount = await Url.countDocuments();
    const userCount = await User.countDocuments();
    
    if (urlCount === 0) {
      console.log('Creating test URL data...');
      
      // Create test URLs
      const testUrls = [
        {
          originalUrl: 'https://www.google.com',
          shortUrl: 'google',
          customAlias: 'google',
          clicks: 42,
          isActive: true,
          clickHistory: [
            {
              timestamp: new Date(),
              referrer: 'Direct',
              userAgent: 'Mozilla/5.0',
              ip: '127.0.0.1',
              deviceType: 'Desktop',
              browser: 'Chrome',
              os: 'Windows',
              country: 'USA',
              city: 'New York'
            }
          ]
        },
        {
          originalUrl: 'https://www.github.com',
          shortUrl: 'github',
          customAlias: 'github',
          clicks: 27,
          isActive: true,
          clickHistory: [
            {
              timestamp: new Date(),
              referrer: 'Direct',
              userAgent: 'Mozilla/5.0',
              ip: '127.0.0.1',
              deviceType: 'Desktop',
              browser: 'Firefox',
              os: 'MacOS',
              country: 'Canada',
              city: 'Toronto'
            }
          ]
        }
      ];
      
      await Url.insertMany(testUrls);
      console.log('Test URL data created successfully!');
    }
    
    if (userCount === 0) {
      console.log('Creating test user data...');
      
      // Create test user
      const testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      
      await testUser.save();
      console.log('Test user data created successfully!');
    }
  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

// Helper function to validate URL
function isValidUrl(string) {
  try {
    // First, try to handle URLs with special characters
    let url = string.trim();
    
    // Make sure the URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Try to create a URL object to validate
    const parsedUrl = new URL(url);
    
    // Check if the URL has a valid hostname
    if (!parsedUrl.hostname.includes('.')) {
      console.log('Invalid URL: No domain extension found');
      return false;
    }
    
    // Return the normalized URL with protocol
    return url;
  } catch (error) {
    console.error('URL validation error:', error.message);
    return false;
  }
}

// Helper function to record a click with enhanced analytics
async function recordClick(url, req) {
  try {
    // Extract user agent info
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referrer = req.headers['referer'] || 'Direct';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Detect device type
    let deviceType = 'Unknown';
    if (userAgent.match(/mobile|android|iphone|ipad|ipod/i)) {
      deviceType = 'Mobile';
    } else if (userAgent.match(/tablet|ipad/i)) {
      deviceType = 'Tablet';
    } else if (userAgent.match(/windows|macintosh|linux/i)) {
      deviceType = 'Desktop';
    }
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.match(/chrome/i)) {
      browser = 'Chrome';
    } else if (userAgent.match(/firefox/i)) {
      browser = 'Firefox';
    } else if (userAgent.match(/safari/i)) {
      browser = 'Safari';
    } else if (userAgent.match(/edge/i)) {
      browser = 'Edge';
    } else if (userAgent.match(/opera|opr/i)) {
      browser = 'Opera';
    } else if (userAgent.match(/msie|trident/i)) {
      browser = 'Internet Explorer';
    }
    
    // Detect OS
    let os = 'Unknown';
    if (userAgent.match(/windows/i)) {
      os = 'Windows';
    } else if (userAgent.match(/macintosh|mac os/i)) {
      os = 'MacOS';
    } else if (userAgent.match(/linux/i)) {
      os = 'Linux';
    } else if (userAgent.match(/android/i)) {
      os = 'Android';
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
      os = 'iOS';
    }
    
    // Create click record
    const clickData = {
      timestamp: new Date(),
      referrer,
      userAgent,
      ip,
      deviceType,
      browser,
      os,
      country: 'Unknown', // Would need a geo-IP service for this
      city: 'Unknown'     // Would need a geo-IP service for this
    };
    
    // Add to click history and increment counter
    url.clickHistory.push(clickData);
    url.clicks += 1;
    
    // Save the updated URL
    await url.save();
    
    return clickData;
  } catch (error) {
    console.error('Error recording click:', error);
    return null;
  }
}

// Routes
// Create a new shortened URL
app.post('/api/urls', async (req, res) => {
  try {
    console.log('Received URL creation request:', req.body);
    const { originalUrl, customAlias, expiresAt, password, previewTitle, previewDescription, previewImage } = req.body;

    // Validate URL
    if (!originalUrl) {
      console.error('Missing originalUrl in request');
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Validate and normalize the URL
    const validatedUrl = isValidUrl(originalUrl);
    if (!validatedUrl) {
      console.error('Invalid URL:', originalUrl);
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    console.log('Validated URL:', validatedUrl);

    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl: validatedUrl });
    if (existingUrl) {
      console.log('URL already exists:', existingUrl);
      // Return the existing URL
      const fullShortUrl = existingUrl.getFullShortUrl();
      const responseObj = {
        ...existingUrl.toObject(),
        fullShortUrl
      };
      console.log('Sending existing URL response:', responseObj);
      return res.status(200).json(responseObj);
    }

    // Generate or use custom alias
    let shortUrl;
    if (customAlias) {
      // Check if custom alias is already in use
      const aliasExists = await Url.findOne({ shortUrl: customAlias });
      if (aliasExists) {
        console.error('Custom alias already in use:', customAlias);
        return res.status(409).json({ message: 'Custom alias already in use' });
      }
      shortUrl = customAlias;
      console.log('Using custom alias:', shortUrl);
    } else {
      // Generate a semantic short code based on the original URL
      shortUrl = generateSemanticShortCode(validatedUrl);
      
      // Check if the generated code already exists
      let codeExists = await Url.findOne({ shortUrl });
      let attempts = 0;
      const maxAttempts = 5;
      
      // If code exists, try to generate a new one up to maxAttempts times
      while (codeExists && attempts < maxAttempts) {
        console.log(`Generated code ${shortUrl} already exists, trying again...`);
        shortUrl = generateSemanticShortCode(validatedUrl);
        codeExists = await Url.findOne({ shortUrl });
        attempts++;
      }
      
      // If we still have a collision after maxAttempts, fall back to random code
      if (codeExists) {
        console.log(`Could not generate unique semantic code after ${maxAttempts} attempts, using random code`);
        shortUrl = generateShortCode();
        
        // Ensure the random code is unique
        codeExists = await Url.findOne({ shortUrl });
        while (codeExists) {
          shortUrl = generateShortCode();
          codeExists = await Url.findOne({ shortUrl });
        }
      }
      
      console.log('Generated semantic short code:', shortUrl);
    }
    
    // Set expiration date if provided
    let expiration = null;
    if (expiresAt) {
      expiration = new Date(expiresAt);
      console.log('Using provided expiration date:', expiration);
    } else {
      // Default expiration
      expiration = new Date();
      expiration.setDate(expiration.getDate() + config.urlShortener.expirationDays);
      console.log('Using default expiration date:', expiration);
    }

    // Create new URL document
    const newUrl = new Url({
      originalUrl: validatedUrl,
      shortUrl,
      customAlias,
      expiresAt: expiration,
      clicks: 0,
      isActive: true,
      password: password || null,
      preview: {
        title: previewTitle || null,
        description: previewDescription || null,
        image: previewImage || null
      }
    });

    console.log('Saving new URL document:', newUrl);
    await newUrl.save();
    console.log('Created new shortened URL:', newUrl);

    // Return the full short URL
    const fullShortUrl = newUrl.getFullShortUrl();
    console.log('Full short URL:', fullShortUrl);
    
    const responseObj = {
      ...newUrl.toObject(),
      fullShortUrl
    };
    console.log('Sending response:', responseObj);
    
    res.status(201).json(responseObj);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get URL by short code
app.get('/api/urls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.isExpired()) {
      return res.status(410).json({ message: 'URL has expired' });
    }

    if (!url.isActive) {
      return res.status(410).json({ message: 'URL has been deactivated' });
    }

    // Add the full short URL to the response
    const responseData = url.toObject();
    responseData.fullShortUrl = url.getFullShortUrl();

    res.json(responseData);
  } catch (error) {
    console.error('Error getting URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redirect to original URL
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Skip API routes
    if (shortCode.startsWith('api') || shortCode === 'favicon.ico') {
      return res.status(404).send('Not found');
    }
    
    // Find the URL in the database
    const url = await Url.findOne({ shortUrl: shortCode, isActive: true });
    
    if (!url) {
      return res.status(404).send('URL not found');
    }
    
    // Check if URL is expired
    if (url.isExpired()) {
      return res.status(410).send('URL has expired');
    }
    
    // If the URL is password-protected, check if the password is provided
    if (url.password) {
      // If this is a direct access without password, show the password form
      if (!req.query.password) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Protected Link</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 2rem;
                width: 90%;
                max-width: 400px;
                text-align: center;
              }
              h1 {
                color: #333;
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
              }
              form {
                display: flex;
                flex-direction: column;
              }
              input {
                padding: 0.75rem;
                margin-bottom: 1rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
              }
              button {
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: 4px;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              button:hover {
                background-color: #2563eb;
              }
              .error {
                color: #ef4444;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Protected Link</h1>
              ${req.query.error ? '<p class="error">Incorrect password. Please try again.</p>' : ''}
              <form method="GET">
                <input type="password" name="password" placeholder="Enter password" required>
                <button type="submit">Access Link</button>
              </form>
            </div>
          </body>
          </html>
        `);
      }
      
      // If password is provided but incorrect
      if (req.query.password !== url.password) {
        return res.redirect(`/${shortCode}?error=1`);
      }
    }
    
    // Record the click with analytics
    await recordClick(url, req);
    
    // If the URL has custom preview metadata and this is a bot request (like social media crawlers)
    const isBot = /bot|crawler|spider|facebook|twitter|linkedin|slack/i.test(req.headers['user-agent']);
    if (isBot && (url.preview.title || url.preview.description || url.preview.image)) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${url.preview.title || 'Shared Link'}</title>
          <meta property="og:title" content="${url.preview.title || 'Shared Link'}">
          <meta property="og:description" content="${url.preview.description || ''}">
          ${url.preview.image ? `<meta property="og:image" content="${url.preview.image}">` : ''}
          <meta property="og:url" content="${url.originalUrl}">
          <meta name="twitter:card" content="summary_large_image">
          <script>
            window.location.href = "${url.originalUrl}";
          </script>
        </head>
        <body>
          <p>Redirecting to ${url.originalUrl}...</p>
        </body>
        </html>
      `);
    }
    
    // Redirect to the original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Server error');
  }
});

// Get analytics for a URL
app.get('/api/urls/:shortCode/analytics', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Process click history to get analytics
    const clicksByDate = {};
    const referrers = {};
    const devices = {};
    const browsers = {};
    const os = {};

    url.clickHistory.forEach((click) => {
      // Process clicks by date
      const date = click.timestamp.toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      // Process referrers
      const referrer = click.referrer || 'Direct';
      referrers[referrer] = (referrers[referrer] || 0) + 1;

      // Process devices (simplified)
      let device = click.deviceType || 'Unknown';
      devices[device] = (devices[device] || 0) + 1;

      // Process browsers
      let browser = click.browser || 'Unknown';
      browsers[browser] = (browsers[browser] || 0) + 1;

      // Process OS
      let operatingSystem = click.os || 'Unknown';
      os[operatingSystem] = (os[operatingSystem] || 0) + 1;
    });

    // Format data for response
    const clicksByDateArray = Object.entries(clicksByDate).map(([date, clicks]) => ({
      date,
      clicks,
    }));

    const referrersArray = Object.entries(referrers).map(([source, count]) => ({
      source,
      count,
    }));

    const devicesArray = Object.entries(devices).map(([type, count]) => ({
      type,
      count,
    }));

    const browsersArray = Object.entries(browsers).map(([type, count]) => ({
      type,
      count,
    }));

    const osArray = Object.entries(os).map(([type, count]) => ({
      type,
      count,
    }));

    const analytics = {
      totalClicks: url.clicks,
      clicksByDate: clicksByDateArray,
      referrers: referrersArray,
      devices: devicesArray,
      browsers: browsersArray,
      os: osArray,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate a URL
app.put('/api/urls/:shortCode/deactivate', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    url.isActive = false;
    await url.save();

    res.json({ message: 'URL deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all URLs (for testing)
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 }).limit(50);
    
    // Add full short URL to each URL
    const responseData = urls.map(url => {
      const urlObj = url.toObject();
      urlObj.fullShortUrl = url.getFullShortUrl();
      return urlObj;
    });
    
    res.json(responseData);
  } catch (error) {
    console.error('Error getting URLs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get aggregate analytics for all URLs
app.get('/api/analytics', async (req, res) => {
  try {
    // Get all URLs
    const urls = await Url.find({ isActive: true });
    
    // Calculate total clicks
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    
    // Initialize data structures for analytics
    const clicksByDayOfWeek = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    const referrerMap = new Map();
    const deviceMap = new Map();
    
    // Process all click history
    urls.forEach(url => {
      if (url.clickHistory && url.clickHistory.length > 0) {
        url.clickHistory.forEach(click => {
          // Process day of week
          const clickDate = new Date(click.timestamp);
          const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][clickDate.getDay()];
          clicksByDayOfWeek[dayOfWeek]++;
          
          // Process referrer
          const referrer = click.referrer || 'Direct';
          referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
          
          // Process device type
          const deviceType = click.deviceType || 'Desktop';
          deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1);
        });
      }
    });
    
    // Convert day of week data to array format
    const clicksByDate = Object.entries(clicksByDayOfWeek).map(([date, clicks]) => ({ date, clicks }));
    
    // Convert maps to arrays for response
    let referrers = Array.from(referrerMap.entries()).map(([source, count]) => ({ source, count }));
    let devices = Array.from(deviceMap.entries()).map(([type, count]) => ({ type, count }));
    
    // Sort by count in descending order
    referrers.sort((a, b) => b.count - a.count);
    devices.sort((a, b) => b.count - a.count);
    
    // If no real data, use sample data
    if (totalClicks === 0) {
      // Sample data for demonstration
      return res.json({
        totalClicks: 145,
        clicksByDate: [
          { date: 'Mon', clicks: 12 },
          { date: 'Tue', clicks: 19 },
          { date: 'Wed', clicks: 25 },
          { date: 'Thu', clicks: 31 },
          { date: 'Fri', clicks: 24 },
          { date: 'Sat', clicks: 18 },
          { date: 'Sun', clicks: 16 }
        ],
        referrers: [
          { source: 'Direct', count: 68 },
          { source: 'Twitter', count: 42 },
          { source: 'Facebook', count: 21 },
          { source: 'LinkedIn', count: 14 }
        ],
        devices: [
          { type: 'Mobile', count: 87 },
          { type: 'Desktop', count: 52 },
          { type: 'Tablet', count: 6 }
        ]
      });
    }
    
    // Ensure we have at least some referrers and devices
    if (referrers.length === 0) {
      referrers = [
        { source: 'Direct', count: totalClicks }
      ];
    }
    
    if (devices.length === 0) {
      devices = [
        { type: 'Desktop', count: totalClicks }
      ];
    }
    
    // Return analytics data
    res.json({
      totalClicks,
      clicksByDate,
      referrers,
      devices
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics for a specific time period
app.get('/api/analytics/timeframe', async (req, res) => {
  try {
    // Get query parameters
    const { period = 'day', count = 7 } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case 'hour':
        startDate.setHours(startDate.getHours() - count);
        break;
      case 'day':
        startDate.setDate(startDate.getDate() - count);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - (count * 7));
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - count);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - count);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to 7 days
    }
    
    // Find all URLs
    const urls = await Url.find();
    
    // Initialize data structure
    const timeframeData = {};
    let totalClicks = 0;
    
    // Process each URL's click history
    urls.forEach(url => {
      url.clickHistory.forEach(click => {
        const clickTime = new Date(click.timestamp);
        
        // Skip clicks outside the time range
        if (clickTime < startDate || clickTime > endDate) return;
        
        // Format the time bucket based on period
        let timeBucket;
        switch(period) {
          case 'hour':
            timeBucket = clickTime.toISOString().substring(0, 13) + ':00'; // YYYY-MM-DDTHH:00
            break;
          case 'day':
            timeBucket = clickTime.toISOString().substring(0, 10); // YYYY-MM-DD
            break;
          case 'week':
            // Get the week number
            const weekNum = Math.ceil((clickTime.getDate() + 
              (new Date(clickTime.getFullYear(), clickTime.getMonth(), 1).getDay())) / 7);
            timeBucket = `${clickTime.getFullYear()}-W${weekNum}`;
            break;
          case 'month':
            timeBucket = `${clickTime.getFullYear()}-${(clickTime.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'year':
            timeBucket = clickTime.getFullYear().toString();
            break;
          default:
            timeBucket = clickTime.toISOString().substring(0, 10); // Default to day
        }
        
        // Increment the count for this time bucket
        timeframeData[timeBucket] = (timeframeData[timeBucket] || 0) + 1;
        totalClicks++;
      });
    });
    
    // Convert to array and sort by time
    const timeSeriesData = Object.entries(timeframeData)
      .map(([time, clicks]) => ({ time, clicks }))
      .sort((a, b) => a.time.localeCompare(b.time));
    
    res.json({
      period,
      totalClicks,
      data: timeSeriesData
    });
  } catch (error) {
    console.error('Error getting timeframe analytics:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get real-time analytics (clicks in the last hour)
app.get('/api/analytics/realtime', async (req, res) => {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Find all URLs
    const urls = await Url.find();
    
    // Initialize data
    const clicksPerMinute = {};
    let totalRealtimeClicks = 0;
    const activeUrls = [];
    
    // Process each URL
    urls.forEach(url => {
      let urlRealtimeClicks = 0;
      
      // Process click history
      url.clickHistory.forEach(click => {
        const clickTime = new Date(click.timestamp);
        
        // Only include clicks from the last hour
        if (clickTime >= oneHourAgo) {
          // Format as HH:MM
          const minute = `${clickTime.getHours().toString().padStart(2, '0')}:${clickTime.getMinutes().toString().padStart(2, '0')}`;
          
          // Increment counts
          clicksPerMinute[minute] = (clicksPerMinute[minute] || 0) + 1;
          totalRealtimeClicks++;
          urlRealtimeClicks++;
        }
      });
      
      // Add to active URLs if it has realtime clicks
      if (urlRealtimeClicks > 0) {
        activeUrls.push({
          shortUrl: url.shortUrl,
          fullShortUrl: url.getFullShortUrl(),
          originalUrl: url.originalUrl,
          realtimeClicks: urlRealtimeClicks
        });
      }
    });
    
    // Convert to array and sort by time
    const timeSeriesData = Object.entries(clicksPerMinute)
      .map(([minute, clicks]) => ({ minute, clicks }))
      .sort((a, b) => a.minute.localeCompare(b.minute));
    
    // Sort active URLs by realtime clicks
    activeUrls.sort((a, b) => b.realtimeClicks - a.realtimeClicks);
    
    res.json({
      totalRealtimeClicks,
      clicksPerMinute: timeSeriesData,
      activeUrls: activeUrls.slice(0, 10) // Top 10 active URLs
    });
  } catch (error) {
    console.error('Error getting realtime analytics:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get geographic analytics
app.get('/api/analytics/geo', async (req, res) => {
  try {
    // Find all URLs
    const urls = await Url.find();
    
    // Initialize data
    const countries = {};
    const cities = {};
    
    // Process each URL's click history
    urls.forEach(url => {
      url.clickHistory.forEach(click => {
        // Process country data
        const country = click.country || 'Unknown';
        countries[country] = (countries[country] || 0) + 1;
        
        // Process city data
        const city = click.city || 'Unknown';
        cities[city] = (cities[city] || 0) + 1;
      });
    });
    
    // Convert to arrays and sort by count
    const countriesArray = Object.entries(countries)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    const citiesArray = Object.entries(cities)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    res.json({
      countries: countriesArray,
      cities: citiesArray.slice(0, 20) // Top 20 cities
    });
  } catch (error) {
    console.error('Error getting geographic analytics:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    endpoints: {
      createUrl: 'POST /api/urls',
      getUrl: 'GET /api/urls/:shortCode',
      redirect: 'GET /:shortCode',
      getAnalytics: 'GET /api/urls/:shortCode/analytics',
      deactivateUrl: 'PUT /api/urls/:shortCode/deactivate',
      getAllUrls: 'GET /api/urls',
      config: 'GET /api/config'
    }
  });
});

// Add a server-info endpoint to provide the base URL to clients
app.get('/api/server-info', (req, res) => {
  res.json({
    baseUrl: config.urlShortener.baseUrl,
    version: '1.0.0'
  });
});

// Config endpoint to share server configuration with clients
app.get('/api/config', (req, res) => {
  res.json({
    baseUrl: config.urlShortener.baseUrl,
    version: '1.0.0',
    features: {
      customAliases: true,
      analytics: true,
      expiration: true
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('URL Shortener API is running');
});

// Create a simple HTML page for error handling
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #d9534f;
        }
        a {
          color: #0275d8;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <p>If you were trying to access a shortened URL, it may have been removed or never existed.</p>
        <p><a href="/">Go to Homepage</a></p>
      </div>
    </body>
    </html>
  `);
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, config.database.options);
    console.log('Connected to MongoDB');
    
    // Detect the base URL for the application
    const baseUrl = await generateBaseUrl(PORT);
    config.urlShortener.baseUrl = baseUrl;
    console.log('URL Shortener base URL:', baseUrl);
    
    // Start the server
    app.listen(PORT, config.server.host, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Base URL: ${baseUrl}`);
      console.log(`Share this address with your friends to access your shortened URLs`);
    });
    
    // Create test data after successful connection
    createTestData();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
