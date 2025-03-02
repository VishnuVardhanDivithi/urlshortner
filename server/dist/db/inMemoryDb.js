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
exports.inMemoryDb = void 0;
class InMemoryDb {
    constructor() {
        this.urls = [];
    }
    // Create a new shortened URL
    createUrl(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUrl = {
                shortCode: data.shortCode || this.generateShortCode(),
                originalUrl: data.originalUrl || '',
                createdAt: new Date(),
                isActive: data.isActive !== undefined ? data.isActive : true,
                isPasswordProtected: !!data.password,
                password: data.password,
                userId: data.userId,
                clicks: 0
            };
            this.urls.push(newUrl);
            return newUrl;
        });
    }
    // Get a URL by short code
    getUrlByShortCode(shortCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.urls.find(u => u.shortCode === shortCode);
            return url || null;
        });
    }
    // Get all URLs
    getAllUrls(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userId) {
                return this.urls.filter(u => u.userId === userId);
            }
            return [...this.urls];
        });
    }
    // Update a URL
    updateUrl(shortCode, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.urls.findIndex(u => u.shortCode === shortCode);
            if (index === -1)
                return null;
            this.urls[index] = Object.assign(Object.assign({}, this.urls[index]), data);
            return this.urls[index];
        });
    }
    // Delete a URL
    deleteUrl(shortCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.urls.findIndex(u => u.shortCode === shortCode);
            if (index === -1)
                return false;
            this.urls.splice(index, 1);
            return true;
        });
    }
    // Track a click on a URL
    trackClick(shortCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getUrlByShortCode(shortCode);
            if (!url)
                return null;
            url.clicks += 1;
            return url;
        });
    }
    // Generate a random short code
    generateShortCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
// Export a singleton instance
exports.inMemoryDb = new InMemoryDb();
