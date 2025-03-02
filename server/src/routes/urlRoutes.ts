import express from 'express';
import {
  createShortUrl,
  getUrlByShortCode,
  redirectToUrl,
  getUrlAnalytics,
  deactivateUrl,
  activateUrl,
  verifyUrlPassword,
  trackUrlClick
} from '../controllers/urlController';

const router = express.Router();

// Create a new shortened URL
router.post('/', createShortUrl);

// Get URL data by short code
router.get('/:shortCode', getUrlByShortCode);

// Redirect to original URL
router.post('/:shortCode/redirect', redirectToUrl);

// Verify URL password
router.post('/:shortCode/verify', verifyUrlPassword);

// Track URL click
router.post('/:shortCode/click', trackUrlClick);

// Get analytics for a URL
router.get('/:shortCode/analytics', getUrlAnalytics);

// Deactivate a URL
router.put('/:shortCode/deactivate', deactivateUrl);

// Activate a URL
router.put('/:shortCode/activate', activateUrl);

export default router;
