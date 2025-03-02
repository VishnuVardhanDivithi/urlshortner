"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const urlRoutes_1 = __importDefault(require("./routes/urlRoutes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/urls', urlRoutes_1.default);
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener';
const PORT = process.env.PORT || 5000;
// Mock database connection for demo purposes
console.log('Starting server with mock database...');
// Start server without MongoDB connection
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Basic route
app.get('/', (_req, res) => {
    res.send('URL Shortener API is running');
});
// Server info route
app.get('/api/server-info', (_req, res) => {
    res.json({
        baseUrl: `http://localhost:${PORT}`,
        status: 'running'
    });
});
