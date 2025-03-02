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
exports.trackUrlClick = exports.verifyUrlPassword = exports.activateUrl = exports.deactivateUrl = exports.getUrlAnalytics = exports.redirectToUrl = exports.getUrlByShortCode = exports.createShortUrl = void 0;
const inMemoryDb_1 = require("../db/inMemoryDb");
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
        const { originalUrl, customAlias, expiresAt, password } = req.body;
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
        let shortCode = customAlias;
        // If no custom alias provided, generate a random code
        if (!shortCode) {
            shortCode = generateShortCode();
        }
        else {
            // Check if custom alias already exists
            const existingUrl = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
            if (existingUrl) {
                return res.status(409).json({ message: 'Custom alias already in use' });
            }
        }
        // Create new URL record
        const newUrl = yield inMemoryDb_1.inMemoryDb.createUrl({
            shortCode,
            originalUrl,
            isActive: true,
            password,
            userId: req.body.userId || 'anonymous'
        });
        return res.status(201).json({
            shortCode: newUrl.shortCode,
            originalUrl: newUrl.originalUrl,
            createdAt: newUrl.createdAt,
            isActive: newUrl.isActive,
            isPasswordProtected: newUrl.isPasswordProtected
        });
    }
    catch (error) {
        console.error('Error creating short URL:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.createShortUrl = createShortUrl;
// Get URL by short code
const getUrlByShortCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        return res.json({
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            createdAt: url.createdAt,
            isActive: url.isActive,
            isPasswordProtected: url.isPasswordProtected,
            clicks: url.clicks
        });
    }
    catch (error) {
        console.error('Error getting URL:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.getUrlByShortCode = getUrlByShortCode;
// Redirect to original URL
const redirectToUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const { password } = req.body;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        if (!url.isActive) {
            return res.status(410).json({ message: 'This URL has been deactivated' });
        }
        // Check if URL is password protected
        if (url.isPasswordProtected && url.password !== password) {
            return res.status(401).json({ message: 'Password required or incorrect' });
        }
        // Track click
        yield inMemoryDb_1.inMemoryDb.trackClick(shortCode);
        return res.json({ originalUrl: url.originalUrl });
    }
    catch (error) {
        console.error('Error redirecting to URL:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.redirectToUrl = redirectToUrl;
// Get analytics for a URL
const getUrlAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        // Generate some mock analytics data
        const now = new Date();
        const days = 7;
        const dailyClicks = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            // Generate more clicks for weekdays (Mon, Wed, Fri)
            const dayOfWeek = date.getDay();
            let clickCount = 0;
            if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
                // Monday, Wednesday, Friday - higher traffic
                clickCount = Math.floor(Math.random() * 15) + 10;
            }
            else if (dayOfWeek === 0 || dayOfWeek === 6) {
                // Weekend - lower traffic
                clickCount = Math.floor(Math.random() * 5) + 1;
            }
            else {
                // Other weekdays - medium traffic
                clickCount = Math.floor(Math.random() * 10) + 5;
            }
            dailyClicks.push({
                date: date.toISOString().split('T')[0],
                clicks: clickCount
            });
        }
        // Generate referrer data
        const referrers = [
            { source: 'Direct', count: Math.floor(Math.random() * 30) + 20 },
            { source: 'Google', count: Math.floor(Math.random() * 25) + 15 },
            { source: 'Facebook', count: Math.floor(Math.random() * 20) + 10 },
            { source: 'Twitter', count: Math.floor(Math.random() * 15) + 5 },
            { source: 'LinkedIn', count: Math.floor(Math.random() * 10) + 1 }
        ];
        // Generate device data
        const devices = [
            { type: 'Desktop', count: Math.floor(Math.random() * 40) + 30 },
            { type: 'Mobile', count: Math.floor(Math.random() * 35) + 25 },
            { type: 'Tablet', count: Math.floor(Math.random() * 15) + 5 }
        ];
        return res.json({
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            totalClicks: url.clicks,
            dailyClicks,
            referrers,
            devices
        });
    }
    catch (error) {
        console.error('Error getting URL analytics:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.getUrlAnalytics = getUrlAnalytics;
// Deactivate a URL
const deactivateUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        yield inMemoryDb_1.inMemoryDb.updateUrl(shortCode, { isActive: false });
        return res.json({ message: 'URL deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating URL:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.deactivateUrl = deactivateUrl;
// Activate a URL
const activateUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        yield inMemoryDb_1.inMemoryDb.updateUrl(shortCode, { isActive: true });
        return res.json({ message: 'URL activated successfully' });
    }
    catch (error) {
        console.error('Error activating URL:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.activateUrl = activateUrl;
// Verify URL password
const verifyUrlPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const { password } = req.body;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        if (!url.isActive) {
            return res.status(410).json({ message: 'This URL has been deactivated' });
        }
        // Check if URL is password protected
        if (url.isPasswordProtected && url.password !== password) {
            return res.status(401).json({ message: 'Password required or incorrect' });
        }
        // Track click
        yield inMemoryDb_1.inMemoryDb.trackClick(shortCode);
        return res.json({
            originalUrl: url.originalUrl,
            isActive: url.isActive
        });
    }
    catch (error) {
        console.error('Error verifying URL password:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.verifyUrlPassword = verifyUrlPassword;
// Track a click on a URL
const trackUrlClick = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortCode } = req.params;
        const { referrer, userAgent } = req.body;
        const url = yield inMemoryDb_1.inMemoryDb.getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }
        // Track click
        yield inMemoryDb_1.inMemoryDb.trackClick(shortCode);
        // Log additional information
        console.log(`Click tracked for ${shortCode} - Referrer: ${referrer}, UserAgent: ${userAgent}`);
        return res.json({ message: 'Click tracked successfully' });
    }
    catch (error) {
        console.error('Error tracking URL click:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.trackUrlClick = trackUrlClick;
