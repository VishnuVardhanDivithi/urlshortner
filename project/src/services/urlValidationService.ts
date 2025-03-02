import axios from 'axios';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validates if a URL is real by checking its format
 * @param url The URL to validate
 * @returns A validation result object
 */
export const validateUrl = async (url: string): Promise<ValidationResult> => {
  // Basic URL format validation
  if (!url) {
    return { isValid: false, message: 'Please enter a URL' };
  }

  try {
    // Add protocol if missing
    let urlToCheck = url;
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck;
    }

    // Check if the URL is valid using regex
    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
    if (!urlPattern.test(urlToCheck)) {
      return { 
        isValid: false, 
        message: 'Invalid URL format. Please enter a valid URL (e.g., example.com).' 
      };
    }

    // Skip actual HTTP request validation due to CORS limitations in browser
    // Instead, just validate the format and assume it's reachable
    return { isValid: true, message: 'URL is valid' };
    
  } catch (_err) {
    // This should rarely happen with the simplified validation
    return { 
      isValid: false, 
      message: 'Error validating URL format. Please check if the URL is correct.' 
    };
  }
};

/**
 * Checks if a URL might be malicious based on common patterns
 * @param url The URL to check
 * @returns True if the URL might be malicious
 */
export const isMaliciousUrl = (url: string): boolean => {
  // Convert to lowercase for case-insensitive matching
  const lowerUrl = url.toLowerCase();
  
  // List of suspicious keywords often found in phishing or malicious URLs
  const suspiciousKeywords = [
    'login', 'signin', 'verify', 'verification', 'account', 'password',
    'secure', 'update', 'banking', 'paypal', 'ebay', 'amazon', 'apple',
    'microsoft', 'google', 'facebook', 'instagram', 'confirm', 'wallet',
    'bitcoin', 'crypto', 'bank', 'credit', 'debit', 'card', 'ssn', 'social',
    'security', 'authenticate', 'authorize'
  ];
  
  // Check for suspicious TLDs often used in phishing
  const suspiciousTlds = [
    '.tk', '.top', '.xyz', '.gq', '.ml', '.ga', '.cf', '.info', '.ru', '.cn'
  ];
  
  // Check for suspicious patterns in the URL
  const hasSuspiciousKeyword = suspiciousKeywords.some(keyword => 
    lowerUrl.includes(keyword) && 
    !lowerUrl.includes('github.com') && // Exclude legitimate sites that might contain keywords
    !lowerUrl.includes('stackoverflow.com') &&
    !lowerUrl.includes('developer.mozilla.org')
  );
  
  const hasSuspiciousTld = suspiciousTlds.some(tld => lowerUrl.endsWith(tld));
  
  // Check for IP address URLs (often used in phishing)
  const isIpAddress = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lowerUrl);
  
  // Check for excessive subdomains (common in phishing URLs)
  const hasExcessiveSubdomains = (lowerUrl.match(/\./g) || []).length > 3;
  
  // Check for URLs with encoded characters (sometimes used to hide malicious URLs)
  const hasEncodedCharacters = lowerUrl.includes('%') && 
                              (lowerUrl.includes('%3A') || 
                               lowerUrl.includes('%2F') || 
                               lowerUrl.includes('%00'));
  
  return hasSuspiciousTld || isIpAddress || hasExcessiveSubdomains || hasEncodedCharacters || hasSuspiciousKeyword;
};
