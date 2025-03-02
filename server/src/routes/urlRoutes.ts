import express from 'express';
import {
  createShortUrl,
  getUrlByShortCode,
  redirectToUrl,
  getUrlAnalytics,
  deactivateUrl,
} from '../controllers/urlController';

const router = express.Router();

// Create a new shortened URL
router.post('/', createShortUrl);

// Get URL data by short code
router.get('/:shortCode', getUrlByShortCode);

// Redirect to original URL
router.get('/:shortCode/redirect', redirectToUrl);

// Get analytics for a URL
router.get('/:shortCode/analytics', getUrlAnalytics);

// Deactivate a URL
router.put('/:shortCode/deactivate', deactivateUrl);

export default router;
