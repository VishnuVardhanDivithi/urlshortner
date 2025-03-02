// In-memory database for local testing
interface UrlRecord {
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  isActive: boolean;
  isPasswordProtected: boolean;
  password?: string;
  userId?: string;
  clicks: number;
}

class InMemoryDb {
  private urls: UrlRecord[] = [];

  // Create a new shortened URL
  async createUrl(data: Partial<UrlRecord>): Promise<UrlRecord> {
    const newUrl: UrlRecord = {
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
  }

  // Get a URL by short code
  async getUrlByShortCode(shortCode: string): Promise<UrlRecord | null> {
    const url = this.urls.find(u => u.shortCode === shortCode);
    return url || null;
  }

  // Get all URLs
  async getAllUrls(userId?: string): Promise<UrlRecord[]> {
    if (userId) {
      return this.urls.filter(u => u.userId === userId);
    }
    return [...this.urls];
  }

  // Update a URL
  async updateUrl(shortCode: string, data: Partial<UrlRecord>): Promise<UrlRecord | null> {
    const index = this.urls.findIndex(u => u.shortCode === shortCode);
    if (index === -1) return null;
    
    this.urls[index] = { ...this.urls[index], ...data };
    return this.urls[index];
  }

  // Delete a URL
  async deleteUrl(shortCode: string): Promise<boolean> {
    const index = this.urls.findIndex(u => u.shortCode === shortCode);
    if (index === -1) return false;
    
    this.urls.splice(index, 1);
    return true;
  }

  // Track a click on a URL
  async trackClick(shortCode: string): Promise<UrlRecord | null> {
    const url = await this.getUrlByShortCode(shortCode);
    if (!url) return null;
    
    url.clicks += 1;
    return url;
  }

  // Generate a random short code
  private generateShortCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export a singleton instance
export const inMemoryDb = new InMemoryDb();
