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
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-render-frontend-url.onrender.com', 'https://your-render-backend-url.onrender.com']
        : 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/urls', urlRoutes_1.default);
// Port configuration
const PORT = process.env.PORT || 5000;
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Basic route
app.get('/', (_req, res) => {
    res.send('URL Shortener API is running');
});
