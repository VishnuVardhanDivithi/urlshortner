"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUrl = exports.getUrlAnalytics = exports.redirectToUrl = exports.getUrlByShortCode = exports.createShortUrl = void 0;
// Mock data storage
const mockUrls = new Map();
// Generate a random short code
const generateShortCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
// Create a new shortened URL
const createShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { originalUrl, customAlias, expiresAt, password, previewTitle, previewDescription, previewImage } = req.body;
        if (!originalUrl) {
            return res.status(400).json({ message: 'Original URL is required' });
        }
        // Check if URL is valid
        try {
            new URL(originalUrl);
        }
        catch (err) {
            return res.status(400).json({ message: 'Invalid URL format' });
        }
        let shortUrl = customAlias;
        // If no custom alias provided, generate a random code
        if (!shortUrl) {
            shortUrl = generateShortCode();
        }
        else {
            // Check if custom alias already exists
            if (mockUrls.has(shortUrl)) {
                return res.status(409).json({ message: 'Custom alias already in use' });
            }
        }
        // Create new URL document
        const newUrl = {
            _id: `mock_${Date.now()}`,
            originalUrl,
            shortUrl,
            customAlias: customAlias || null,
            expiresAt: expiresAt || null,
            clicks: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            clickHistory: [],
            hasPassword: !!password,
            hasCustomPreview: !!(previewTitle || previewDescription || previewImage)
        };
        // Store in mock database
        mockUrls.set(shortUrl, newUrl);
        res.status(201).json(newUrl);
    }
    catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createShortUrl = createShortUrl;
// Get URL by short code
const getUrlByShortCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = mockUrls.get(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
            return res.status(410).json({ message: 'URL has expired' });
        }
        if (!url.isActive) {
            return res.status(410).json({ message: 'URL has been deactivated' });
        }
        res.json(url);
    }
    catch (error) {
        console.error('Error getting URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUrlByShortCode = getUrlByShortCode;
// Redirect to original URL
const redirectToUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = mockUrls.get(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
            return res.status(410).json({ message: 'URL has expired' });
        }
        if (!url.isActive) {
            return res.status(410).json({ message: 'URL has been deactivated' });
        }
        // Record click
        url.clicks += 1;
        url.clickHistory.push({
            timestamp: new Date(),
            referrer: req.get('referer') || '',
            userAgent: req.get('user-agent') || '',
            ip: req.ip,
        });
        res.redirect(url.originalUrl);
    }
    catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.redirectToUrl = redirectToUrl;
// Get analytics for a URL
const getUrlAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = mockUrls.get(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        // Generate mock analytics data
        const analytics = {
            totalClicks: url.clicks,
            clicksByDate: [
                { date: 'Mon', clicks: Math.floor(Math.random() * 20) },
                { date: 'Tue', clicks: Math.floor(Math.random() * 20) },
                { date: 'Wed', clicks: Math.floor(Math.random() * 20) },
                { date: 'Thu', clicks: Math.floor(Math.random() * 20) },
                { date: 'Fri', clicks: Math.floor(Math.random() * 20) },
                { date: 'Sat', clicks: Math.floor(Math.random() * 20) },
                { date: 'Sun', clicks: Math.floor(Math.random() * 20) }
            ],
            referrers: [
                { source: 'Direct', count: Math.floor(Math.random() * 15) },
                { source: 'Twitter', count: Math.floor(Math.random() * 10) },
                { source: 'Facebook', count: Math.floor(Math.random() * 8) },
                { source: 'LinkedIn', count: Math.floor(Math.random() * 5) }
            ],
            devices: [
                { type: 'Desktop', count: Math.floor(Math.random() * 20) },
                { type: 'Mobile', count: Math.floor(Math.random() * 15) },
                { type: 'Tablet', count: Math.floor(Math.random() * 5) }
            ]
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUrlAnalytics = getUrlAnalytics;
// Deactivate a URL
const deactivateUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = mockUrls.get(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        url.isActive = false;
        res.json({ message: 'URL deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deactivateUrl = deactivateUrl;
