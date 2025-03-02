import { Request, Response } from 'express';
import Url from '../models/Url';

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
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Check if URL is valid
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    let shortUrl = customAlias;

    // If no custom alias provided, generate a random code
    if (!shortUrl) {
      shortUrl = generateShortCode();
    } else {
      // Check if custom alias already exists
      const existingUrl = await Url.findOne({ shortUrl });
      if (existingUrl) {
        return res.status(409).json({ message: 'Custom alias already in use' });
      }
    }

    // Create new URL document
    const newUrl = new Url({
      originalUrl,
      shortUrl,
      customAlias,
      expiresAt: expiresAt || null,
      clicks: 0,
      isActive: true,
    });

    await newUrl.save();

    res.status(201).json(newUrl);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get URL by short code
export const getUrlByShortCode = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ message: 'URL has expired' });
    }

    if (!url.isActive) {
      return res.status(410).json({ message: 'URL has been deactivated' });
    }

    res.json(url);
  } catch (error) {
    console.error('Error getting URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Redirect to original URL
export const redirectToUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
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

    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics for a URL
export const getUrlAnalytics = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Process click history to get analytics
    const clicksByDate: { [key: string]: number } = {};
    const referrers: { [key: string]: number } = {};
    const devices: { [key: string]: number } = {};

    url.clickHistory.forEach((click) => {
      // Process clicks by date
      const date = click.timestamp.toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      // Process referrers
      const referrer = click.referrer || 'Direct';
      referrers[referrer] = (referrers[referrer] || 0) + 1;

      // Process devices (simplified)
      let device = 'Unknown';
      if (click.userAgent) {
        if (click.userAgent.includes('Mobile')) {
          device = 'Mobile';
        } else if (click.userAgent.includes('Tablet')) {
          device = 'Tablet';
        } else {
          device = 'Desktop';
        }
      }
      devices[device] = (devices[device] || 0) + 1;
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

    const analytics = {
      totalClicks: url.clicks,
      clicksByDate: clicksByDateArray,
      referrers: referrersArray,
      devices: devicesArray,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate a URL
export const deactivateUrl = async (req: Request, res: Response) => {
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
};
