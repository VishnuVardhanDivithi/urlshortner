const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0', // Listen on all network interfaces
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  
  // URL shortener configuration
  urlShortener: {
    // This will be dynamically set at startup based on the detected IP
    baseUrl: process.env.BASE_URL || '',
    defaultCodeLength: 6,
    expirationDays: 30, // Default expiration time in days
  },
  
  // CORS configuration
  cors: {
    origin: '*', // Allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials
    optionsSuccessStatus: 200,
  },
  
  // Rate limiting (for scalability)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

module.exports = config;
