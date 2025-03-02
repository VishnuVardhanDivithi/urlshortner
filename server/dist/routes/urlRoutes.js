"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const urlController_1 = require("../controllers/urlController");
const router = express_1.default.Router();
// Create a new shortened URL
router.post('/', urlController_1.createShortUrl);
// Get URL data by short code
router.get('/:shortCode', urlController_1.getUrlByShortCode);
// Redirect to original URL
router.get('/:shortCode/redirect', urlController_1.redirectToUrl);
// Get analytics for a URL
router.get('/:shortCode/analytics', urlController_1.getUrlAnalytics);
// Deactivate a URL
router.put('/:shortCode/deactivate', urlController_1.deactivateUrl);
exports.default = router;
