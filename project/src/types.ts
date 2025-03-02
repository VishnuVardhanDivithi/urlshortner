// URL data interface
export interface UrlData {
  _id: string;
  originalUrl: string;
  shortUrl: string;
  customAlias?: string;
  createdAt: string;
  expiresAt?: string;
  clicks: number;
  isActive: boolean;
  clickHistory?: ClickData[];
  fullShortUrl?: string;
  hasPassword?: boolean;
  hasCustomPreview?: boolean;
  userId?: string; // Add userId field to track which user created the URL
}

// Click data interface
export interface ClickData {
  timestamp: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  userId?: string; // Add userId field to track which user's URL was clicked
}

// Form data for creating a new URL
export interface UrlFormData {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string;
  password?: string;
  previewTitle?: string;
  previewDescription?: string;
  previewImage?: string;
  isPrivate?: boolean;
}

// Analytics data interface
export interface AnalyticsData {
  totalClicks: number;
  clicksByDate: {
    date: string;
    clicks: number;
    fullDate?: string;
    actualDate?: Date;
  }[];
  referrers: {
    source: string;
    count: number;
  }[];
  devices: {
    type: string;
    count: number;
  }[];
  userId?: string;
}

// User data interface
export interface UserData {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
  urls?: string[];
}

// Authentication data
export interface AuthData {
  token: string;
  user: UserData;
}

// Login form data
export interface LoginData {
  email: string;
  password: string;
}

// Registration form data
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}