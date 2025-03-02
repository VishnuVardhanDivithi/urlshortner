import { Request, Response } from 'express';
import { inMemoryDb } from '../db/inMemoryDb';

// Generate a random short code
const generateShortCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Create a new shortened URL
export const createShortUrl = async (req: Request, res: Response) => {
  try {
    const { originalUrl, customAlias, expiresAt, password } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Check if URL is valid
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    let shortCode = customAlias;

    // If no custom alias provided, generate a random code
    if (!shortCode) {
      shortCode = generateShortCode();
    } else {
      // Check if custom alias already exists
      const existingUrl = await inMemoryDb.getUrlByShortCode(shortCode);
      if (existingUrl) {
        return res.status(409).json({ message: 'Custom alias already in use' });
      }
    }

    // Create new URL record
    const newUrl = await inMemoryDb.createUrl({
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
  } catch (error) {
    console.error('Error creating short URL:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get URL by short code
export const getUrlByShortCode = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
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
  } catch (error) {
    console.error('Error getting URL:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Redirect to original URL
export const redirectToUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
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
    await inMemoryDb.trackClick(shortCode);
    
    return res.json({ originalUrl: url.originalUrl });
  } catch (error) {
    console.error('Error redirecting to URL:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics for a URL
export const getUrlAnalytics = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
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
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - lower traffic
        clickCount = Math.floor(Math.random() * 5) + 1;
      } else {
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
  } catch (error) {
    console.error('Error getting URL analytics:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate a URL
export const deactivateUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    
    await inMemoryDb.updateUrl(shortCode, { isActive: false });
    
    return res.json({ message: 'URL deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating URL:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Activate a URL
export const activateUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    
    await inMemoryDb.updateUrl(shortCode, { isActive: true });
    
    return res.json({ message: 'URL activated successfully' });
  } catch (error) {
    console.error('Error activating URL:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify URL password
export const verifyUrlPassword = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
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
    await inMemoryDb.trackClick(shortCode);
    
    return res.json({ 
      originalUrl: url.originalUrl,
      isActive: url.isActive
    });
  } catch (error) {
    console.error('Error verifying URL password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Track a click on a URL
export const trackUrlClick = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const { referrer, userAgent } = req.body;
    
    const url = await inMemoryDb.getUrlByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    
    // Track click
    await inMemoryDb.trackClick(shortCode);
    
    // Log additional information
    console.log(`Click tracked for ${shortCode} - Referrer: ${referrer}, UserAgent: ${userAgent}`);
    
    return res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking URL click:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
