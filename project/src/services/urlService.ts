import axios from 'axios';
import { UrlData, UrlFormData, UserData } from '../types';
import { getApiUrl } from './config';

// API base URL - this will be updated dynamically
let API_BASE_URL = getApiUrl();
let CLIENT_BASE_URL = window.location.origin;

// Function to update the base URLs
export const updateBaseUrls = (newBaseUrl: string) => {
  if (newBaseUrl && newBaseUrl !== '') {
    API_BASE_URL = `${newBaseUrl}/api`;
    CLIENT_BASE_URL = newBaseUrl;
    console.log('API base URL updated to:', API_BASE_URL);
    console.log('Client base URL updated to:', CLIENT_BASE_URL);
  }
};

// No need to detect server URL anymore since we're using relative URLs
console.log('Using relative API URL:', API_BASE_URL);
console.log('Client base URL set to:', CLIENT_BASE_URL);

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new shortened URL
export const createShortUrl = async (formData: UrlFormData): Promise<UrlData> => {
  try {
    console.log('Creating short URL with data:', formData);
    
    // Ensure URL has a protocol
    let url = formData.originalUrl;
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      formData.originalUrl = url;
    }
    
    // Handle special characters in the URL
    try {
      // Test if the URL is valid
      new URL(formData.originalUrl);
    } catch (error) {
      console.error('Invalid URL format:', error);
      throw new Error('Invalid URL format. Please check your URL and try again.');
    }
    
    console.log('Sending request to API:', `/urls`, formData);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`/urls`, formData, { headers });
      console.log('Server response:', response.data);
      return response.data;
    } catch (axiosError: any) {
      console.error('Axios error:', axiosError);
      
      // For demo purposes, if the server is not available, return mock data
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
        console.log('Server not available, returning mock data');
        
        // Generate a unique shortcode that includes information about the destination
        let shortUrl = 'mock-';
        
        // Add password indicator to shortcode if password protected
        if (formData.password) {
          shortUrl += 'password-';
          console.log('Adding password protection to mock URL');
        }
        
        // Extract domain from the original URL to include in the shortcode
        try {
          const urlObj = new URL(formData.originalUrl);
          const domain = urlObj.hostname.replace('www.', '');
          shortUrl += `domain-${domain}`;
        } catch (e) {
          // If URL parsing fails, use a random shortcode
          shortUrl += Math.random().toString(36).substring(2, 8);
        }
        
        console.log('Generated mock shortcode:', shortUrl);
        
        const mockData: UrlData = {
          _id: 'mock-id-' + Date.now(),
          originalUrl: formData.originalUrl,
          shortUrl: shortUrl,
          clicks: 0,
          createdAt: new Date().toISOString(),
          isActive: true,
          hasPassword: !!formData.password,
          hasCustomPreview: !!(formData.previewTitle || formData.previewDescription || formData.previewImage),
          userId: getUserIdFromLocalStorage() // Add user ID to mock data
        };
        return mockData;
      }
      throw axiosError;
    }
  } catch (error) {
    console.error('Error creating short URL:', error);
    throw error;
  }
};

// Get all URLs for the current user
export const getAllUrls = async (): Promise<UrlData[]> => {
  try {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`/urls`, { headers });
      return response.data;
    } catch (axiosError: any) {
      // For demo purposes, if the server is not available, return mock data
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
        console.log('Server not available, returning mock data for URLs');
        const userId = getUserIdFromLocalStorage();
        return [
          {
            _id: 'mock-id-1',
            originalUrl: 'https://example.com',
            shortUrl: 'mock-abc123',
            clicks: 42,
            createdAt: new Date().toISOString(),
            isActive: true,
            hasPassword: false,
            hasCustomPreview: true,
            userId: userId
          },
          {
            _id: 'mock-id-2',
            originalUrl: 'https://google.com',
            shortUrl: 'mock-def456',
            clicks: 18,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            isActive: true,
            hasPassword: true,
            hasCustomPreview: false,
            userId: userId
          }
        ];
      }
      throw axiosError;
    }
  } catch (error) {
    console.error('Error fetching URLs:', error);
    throw error;
  }
};

// Get URL analytics for a specific short URL
export const getUrlAnalytics = async (shortCode: string): Promise<any> => {
  try {
    console.log('Getting analytics for URL:', shortCode);
    const headers = getAuthHeaders();
    const response = await axios.get(`/urls/${shortCode}/analytics`, { headers });
    console.log('URL analytics received:', response.data);
    return response.data;
  } catch (axiosError: any) {
    // For demo purposes, if the server is not available, return mock data
    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
      console.log('Server not available, returning mock URL analytics data');
      
      // Get current date and previous dates for the last week
      const today = new Date();
      const dates = Array(7).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      return {
        totalClicks: 42,
        clicksByDate: generateRandomClickData(dates),
        referrers: [
          { source: 'Direct', count: 20 },
          { source: 'Twitter', count: 12 },
          { source: 'Facebook', count: 7 },
          { source: 'LinkedIn', count: 3 }
        ],
        devices: [
          { type: 'Desktop', count: 25 },
          { type: 'Mobile', count: 15 },
          { type: 'Tablet', count: 2 }
        ]
      };
    }
    throw axiosError;
  }
};

// Get analytics data for the current user
export const getAnalytics = async (): Promise<any> => {
  try {
    console.log('Getting analytics data from:', `/analytics`);
    const headers = getAuthHeaders();
    const response = await axios.get(`/analytics`, { headers });
    console.log('Analytics data received:', response.data);
    return response.data;
  } catch (axiosError: any) {
    // For demo purposes, if the server is not available, return mock data
    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
      console.log('Server not available, returning mock analytics data');
      
      // Get current date and previous dates for the last week
      const today = new Date();
      const dates = Array(7).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      // Get user-specific data
      const userId = getUserIdFromLocalStorage();
      const userUrls = await getAllUrls();
      const totalClicks = userUrls.reduce((sum, url) => sum + url.clicks, 0);
      
      return {
        totalClicks,
        clicksByDate: generateRandomClickData(dates),
        referrers: [
          { source: 'Direct', count: Math.round(totalClicks * 0.45) },
          { source: 'Twitter', count: Math.round(totalClicks * 0.25) },
          { source: 'Facebook', count: Math.round(totalClicks * 0.18) },
          { source: 'LinkedIn', count: Math.round(totalClicks * 0.12) }
        ],
        devices: [
          { type: 'Desktop', count: Math.round(totalClicks * 0.55) },
          { type: 'Mobile', count: Math.round(totalClicks * 0.38) },
          { type: 'Tablet', count: Math.round(totalClicks * 0.07) }
        ],
        userId: userId // Add user ID to analytics data
      };
    }
    throw axiosError;
  }
};

// Helper function to generate random click data
const generateRandomClickData = (dates: string[]) => {
  // Create a seed based on the dates to ensure consistent data
  const seed = dates.join('').length;
  
  // Create a predictable pattern for each day of the week
  const baseClicksByDay = {
    'Sun': 8,
    'Mon': 15,
    'Tue': 12,
    'Wed': 18,
    'Thu': 14,
    'Fri': 22,
    'Sat': 10
  };
  
  // Get the current date to calculate actual dates
  const today = new Date();
  
  return dates.map((date, index) => {
    // Extract day name from the date string (e.g., "Mon" from "Mon, Mar 3")
    const dayName = date.split(',')[0];
    
    // Get base clicks for this day of week
    const baseClicks = baseClicksByDay[dayName as keyof typeof baseClicksByDay] || 10;
    
    // Add a small variation but keep it consistent
    const variation = ((date.charCodeAt(0) + seed) % 5) - 2; // -2 to +2 variation
    
    // Create an actual date object for this date
    const actualDate = new Date(today);
    actualDate.setDate(today.getDate() - (6 - index)); // Assuming dates array starts from 6 days ago
    
    return {
      date,
      fullDate: date,
      clicks: baseClicks + variation,
      actualDate
    };
  });
};

// Deactivate a URL
export const deactivateUrl = async (shortCode: string): Promise<void> => {
  try {
    console.log('Deactivating URL:', shortCode);
    const headers = getAuthHeaders();
    await axios.put(`/urls/${shortCode}/deactivate`, {}, { headers });
    console.log('URL deactivated successfully');
  } catch (axiosError: any) {
    // For demo purposes, if the server is not available, just log
    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
      console.log('Server not available, URL would be deactivated');
      return;
    }
    throw axiosError;
  }
};

// Activate a URL
export const activateUrl = async (shortCode: string): Promise<void> => {
  try {
    console.log('Activating URL:', shortCode);
    const headers = getAuthHeaders();
    await axios.put(`/urls/${shortCode}/activate`, {}, { headers });
    console.log('URL activated successfully');
  } catch (axiosError: any) {
    // For demo purposes, if the server is not available, just log
    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
      console.log('Server not available, URL would be activated');
      return;
    }
    throw axiosError;
  }
};

// Get the full shareable URL
export const getShareableUrl = (shortCode: string): string => {
  return `${CLIENT_BASE_URL}/${shortCode}`;
};

// Track a click on a shortened URL
export const trackUrlClick = async (shortCode: string, referrer?: string, userAgent?: string): Promise<void> => {
  try {
    console.log('Tracking click for URL:', shortCode);
    const clickData = {
      referrer: referrer || document.referrer || 'Direct',
      userAgent: userAgent || navigator.userAgent
    };
    
    await axios.post(`/urls/${shortCode}/click`, clickData);
    console.log('Click tracked successfully');
  } catch (error) {
    console.error('Error tracking click:', error);
    // Don't throw error to prevent disrupting user experience
  }
};

// Get user ID from localStorage
const getUserIdFromLocalStorage = (): string | null => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.user?._id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID from localStorage:', error);
    return null;
  }
};

// Get current user details
export const getCurrentUser = (): UserData | null => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.user || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Verify password for a protected URL
export const verifyUrlPassword = async (shortCode: string, password: string): Promise<{success: boolean; originalUrl?: string; isActive?: boolean}> => {
  try {
    console.log('Verifying password for URL:', shortCode);
    
    // For demo/testing purposes - if shortCode contains 'mock' and password is 'demo123'
    if (shortCode.includes('mock') && password === 'demo123') {
      console.log('Mock password verification successful');
      
      // Extract domain from the shortCode if it's in the format 'mock-domain-example.com'
      let originalUrl = 'https://www.google.com';
      const domainMatch = shortCode.match(/mock-domain-(.+)/);
      
      if (domainMatch && domainMatch[1]) {
        const domain = domainMatch[1];
        console.log('Extracted domain from shortCode:', domain);
        
        // Ensure the domain has a protocol
        if (domain.includes('http://') || domain.includes('https://')) {
          originalUrl = domain;
        } else {
          originalUrl = 'https://' + domain;
        }
        
        console.log('Using extracted URL for redirection:', originalUrl);
      }
      
      return {
        success: true,
        originalUrl: originalUrl,
        isActive: true
      };
    }
    
    const response = await axios.post(`/urls/${shortCode}/verify`, { password });
    
    if (response.data && response.data.originalUrl) {
      return {
        success: true,
        originalUrl: response.data.originalUrl,
        isActive: response.data.isActive
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error verifying password:', error);
    
    // For demo/testing purposes - if server is not available and password is 'demo123'
    if ((error as any)?.code === 'ERR_NETWORK' && password === 'demo123') {
      console.log('Mock password verification successful (server offline)');
      
      // Extract domain from the shortCode if it's in the format 'mock-domain-example.com'
      let originalUrl = 'https://www.google.com';
      const domainMatch = shortCode.match(/mock-domain-(.+)/);
      
      if (domainMatch && domainMatch[1]) {
        const domain = domainMatch[1];
        console.log('Extracted domain from shortCode:', domain);
        
        // Ensure the domain has a protocol
        if (domain.includes('http://') || domain.includes('https://')) {
          originalUrl = domain;
        } else {
          originalUrl = 'https://' + domain;
        }
        
        console.log('Using extracted URL for redirection:', originalUrl);
      }
      
      return {
        success: true,
        originalUrl: originalUrl,
        isActive: true
      };
    }
    
    return { success: false };
  }
};

// Get password attempt data from localStorage
export const getPasswordAttempts = (shortCode: string): {count: number; timestamp: number} => {
  try {
    const attemptsData = localStorage.getItem(`pwd_attempts_${shortCode}`);
    if (attemptsData) {
      return JSON.parse(attemptsData);
    }
  } catch (error) {
    console.error('Error getting password attempts:', error);
  }
  
  return { count: 0, timestamp: 0 };
};

// Update password attempt data in localStorage
export const updatePasswordAttempts = (shortCode: string, count: number): void => {
  try {
    localStorage.setItem(`pwd_attempts_${shortCode}`, JSON.stringify({
      count,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error updating password attempts:', error);
  }
};

// Check if password attempts are locked
export const isPasswordAttemptsLocked = (shortCode: string, maxAttempts: number, lockDurationMs: number = 30 * 60 * 1000): boolean => {
  const { count, timestamp } = getPasswordAttempts(shortCode);
  
  // If we haven't reached max attempts, not locked
  if (count < maxAttempts) {
    return false;
  }
  
  // Check if the lock duration has passed
  const now = Date.now();
  const timeSinceLock = now - timestamp;
  
  // If the lock duration has passed, reset attempts and return false
  if (timeSinceLock > lockDurationMs) {
    updatePasswordAttempts(shortCode, 0);
    return false;
  }
  
  // Still locked
  return true;
};

// Reset password attempts
export const resetPasswordAttempts = (shortCode: string): void => {
  updatePasswordAttempts(shortCode, 0);
};