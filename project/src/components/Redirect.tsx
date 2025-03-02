import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  trackUrlClick, 
  verifyUrlPassword, 
  getPasswordAttempts, 
  updatePasswordAttempts, 
  isPasswordAttemptsLocked, 
  resetPasswordAttempts 
} from '../services/urlService';

interface RedirectParams {
  shortCode: string;
}

interface PasswordProtectedProps {
  shortCode: string;
  onSubmit: (password: string) => void;
  attempts: number;
  maxAttempts: number;
  attemptLocked: boolean;
  lockTimeRemaining?: string;
}

// Password entry component for protected URLs
const PasswordProtectedForm: React.FC<PasswordProtectedProps> = ({ 
  shortCode, 
  onSubmit, 
  attempts, 
  maxAttempts, 
  attemptLocked,
  lockTimeRemaining
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    onSubmit(password);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  if (attemptLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Access Locked
            </h2>
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-center text-red-600">
                You have exceeded the maximum number of password attempts.
              </p>
              <p className="mt-2 text-center text-gray-600">
                Please try again after some time or contact the link owner for assistance.
              </p>
              {lockTimeRemaining && (
                <p className="mt-2 text-center text-amber-600 font-medium">
                  Time remaining: {lockTimeRemaining}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Protected Link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This link is password protected. Please enter the password to continue.
          </p>
          {attempts > 0 && (
            <p className="mt-2 text-center text-sm text-amber-600">
              Attempts remaining: {maxAttempts - attempts} of {maxAttempts}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Verifying...' : 'Continue to Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deactivated URL component
const DeactivatedUrlNotice: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Link Deactivated</h2>
          <p className="text-red-600 mb-6">
            This link has been deactivated by its owner and is no longer available.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Please use another link or contact the link owner for an updated URL.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const Redirect: React.FC = () => {
  const { shortCode } = useParams<RedirectParams>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [attemptLocked, setAttemptLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState<string>('');
  
  const MAX_PASSWORD_ATTEMPTS = 5;
  const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Function to check if attempts are locked and update UI
  const checkAttemptsLocked = () => {
    if (!shortCode) return false;
    
    const isLocked = isPasswordAttemptsLocked(shortCode, MAX_PASSWORD_ATTEMPTS, LOCK_DURATION_MS);
    setAttemptLocked(isLocked);
    
    if (isLocked) {
      // Calculate time remaining in lock
      const { timestamp } = getPasswordAttempts(shortCode);
      const now = Date.now();
      const timeElapsed = now - timestamp;
      const timeRemaining = LOCK_DURATION_MS - timeElapsed;
      
      if (timeRemaining > 0) {
        // Format time remaining
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        setLockTimeRemaining(`${minutes}m ${seconds}s`);
        
        // Update the countdown timer every second
        const timer = setTimeout(() => {
          checkAttemptsLocked();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
    
    return isLocked;
  };
  
  // Function to safely redirect to a URL
  const safeRedirect = (url: string) => {
    console.log('Safely redirecting to:', url);
    
    // Ensure the URL has a protocol
    let redirectUrl = url;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
      console.log('Added https:// protocol to URL:', redirectUrl);
    }
    
    // For debugging - display redirect information
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Redirecting...</h2>
        <p style="margin-bottom: 10px;"><strong>Original URL:</strong> ${url}</p>
        <p style="margin-bottom: 10px;"><strong>Redirect URL:</strong> ${redirectUrl}</p>
        <p style="margin-bottom: 20px;">If you are not redirected automatically, click the button below:</p>
        <a href="${redirectUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Website</a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">This page will automatically redirect in 3 seconds...</p>
      </div>
    `;
    
    // Set a timeout to allow the user to see the debug info before redirecting
    setTimeout(() => {
      try {
        console.log('Attempting window.location.replace with:', redirectUrl);
        window.location.replace(redirectUrl);
      } catch (error) {
        console.error('Error with location.replace, falling back to location.href', error);
        
        try {
          console.log('Attempting window.location.href with:', redirectUrl);
          window.location.href = redirectUrl;
        } catch (innerError) {
          console.error('Error with location.href, creating a link element', innerError);
          
          const link = document.createElement('a');
          link.href = redirectUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }, 3000);
  };
  
  // Function to verify password and get original URL
  const verifyPassword = async (password: string) => {
    try {
      // Check if attempts are locked
      if (checkAttemptsLocked()) {
        return;
      }
      
      // Get current attempt count and increment
      const { count } = getPasswordAttempts(shortCode || '');
      const newCount = count + 1;
      
      // Update attempts in localStorage
      updatePasswordAttempts(shortCode || '', newCount);
      
      // Update UI state
      setPasswordAttempts(newCount);
      
      // Check if we've reached max attempts
      if (newCount >= MAX_PASSWORD_ATTEMPTS) {
        setAttemptLocked(true);
        setError('Maximum password attempts exceeded. Please try again later.');
        checkAttemptsLocked(); // Start the countdown timer
        return;
      }
      
      // Show loading state
      setIsLoading(true);
      
      // Verify the password
      console.log(`Verifying password for shortCode: ${shortCode}`);
      const result = await verifyUrlPassword(shortCode || '', password);
      console.log('Password verification result:', result);
      
      if (result.success) {
        // Password is correct, reset attempts
        resetPasswordAttempts(shortCode || '');
        
        // Check if URL is deactivated
        if (!result.isActive) {
          setIsDeactivated(true);
          setIsLoading(false);
          return;
        }
        
        // Track the click with the user agent and referrer
        await trackUrlClick(shortCode || '', document.referrer, navigator.userAgent);
        
        // Redirect to the original URL
        if (result.originalUrl) {
          console.log('Password verified successfully, redirecting to:', result.originalUrl);
          
          // Show success message before redirecting
          setIsLoading(false);
          document.body.innerHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Verified Successfully!</h2>
              <p style="text-align: center; margin-bottom: 10px;">You will be redirected to the original URL in 3 seconds...</p>
              <p style="text-align: center; margin-bottom: 20px;"><strong>Destination:</strong> ${result.originalUrl}</p>
              <div style="text-align: center;">
                <a href="${result.originalUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go Now</a>
              </div>
            </div>
          `;
          
          // Redirect after a short delay
          setTimeout(() => {
            safeRedirect(result.originalUrl);
          }, 3000);
        }
      } else {
        setError('Invalid password. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setError('An error occurred while verifying the password. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Function to resolve the URL
  const resolveUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Resolving URL with shortCode:', shortCode);
      
      // Check if attempts are locked before proceeding
      if (shortCode && checkAttemptsLocked()) {
        console.log('Password attempts are locked for this shortCode');
        setIsPasswordProtected(true);
        setIsLoading(false);
        return;
      }
      
      // For demo purposes - check if this is a password-protected URL
      // This is a more comprehensive check that looks for 'password', 'pwd', or 'protected' in the shortCode
      if (shortCode && (
          shortCode.includes('password') || 
          shortCode.includes('pwd') || 
          shortCode.includes('protected')
        )) {
        console.log('Password-protected URL detected by shortCode pattern:', shortCode);
        setIsPasswordProtected(true);
        setIsLoading(false);
        return;
      }
      
      // For demo purposes, simulate API call
      try {
        console.log('Fetching URL data from API:', `${API_BASE_URL}/urls/${shortCode}`);
        const response = await axios.get(`${API_BASE_URL}/urls/${shortCode}`);
        
        console.log('API response:', response.data);
        
        // Check if URL is deactivated
        if (!response.data.isActive) {
          console.log('URL is deactivated');
          setIsDeactivated(true);
          setIsLoading(false);
          return;
        }
        
        // Check if URL is password protected
        if (response.data.isPasswordProtected || response.data.hasPassword) {
          console.log('Password-protected URL detected from API response');
          setIsPasswordProtected(true);
          setIsLoading(false);
          return;
        }
        
        setOriginalUrl(response.data.originalUrl);
        
        // Track the click with the user agent and referrer
        await trackUrlClick(shortCode || '', document.referrer, navigator.userAgent);
        
        // Redirect to the original URL
        safeRedirect(response.data.originalUrl);
      } catch (axiosError: any) {
        // For demo purposes, if the server is not available, simulate a redirect
        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
          console.log('Server not available, simulating redirect');
          
          // Check if this is a mock URL (for demo purposes)
          if (shortCode?.startsWith('mock-')) {
            // For demo purposes, if the shortCode ends with 'inactive', simulate a deactivated URL
            if (shortCode.includes('inactive')) {
              console.log('Mock inactive URL detected');
              setIsDeactivated(true);
              setIsLoading(false);
              return;
            }
            
            // For demo purposes, check for password protection patterns in the shortCode
            if (shortCode.includes('password') || shortCode.includes('pwd') || shortCode.includes('protected')) {
              console.log('Mock password-protected URL detected:', shortCode);
              setIsPasswordProtected(true);
              setIsLoading(false);
              return;
            }
            
            // Track the click (this will be a no-op in mock mode)
            await trackUrlClick(shortCode, document.referrer, navigator.userAgent);
            
            // Simulate redirect to a demo URL based on the shortCode
            let demoUrl = 'https://www.google.com';
            
            // Extract a target domain from the shortCode if present (format: mock-domain-example.com)
            const domainMatch = shortCode.match(/mock-domain-(.+)/);
            if (domainMatch && domainMatch[1]) {
              const domain = domainMatch[1];
              console.log('Extracted custom domain from shortCode:', domain);
              
              // Ensure the domain has a protocol
              if (domain.includes('http://') || domain.includes('https://')) {
                demoUrl = domain;
              } else {
                demoUrl = 'https://' + domain;
              }
              
              console.log('Constructed demo URL with protocol:', demoUrl);
            }
            
            console.log('Simulating redirect to demo URL:', demoUrl);
            setOriginalUrl(demoUrl);
            safeRedirect(demoUrl);
            return;
          }
          
          // If not a mock URL, redirect to home
          navigate('/');
          return;
        }
        
        throw axiosError;
      }
    } catch (error) {
      console.error('Error resolving URL:', error);
      setError('URL not found or has expired');
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (shortCode) {
      // Check if this is a password-protected URL first
      if (shortCode.includes('password')) {
        console.log('Password-protected URL detected in useEffect:', shortCode);
        setIsPasswordProtected(true);
        const { count } = getPasswordAttempts(shortCode);
        setPasswordAttempts(count);
        checkAttemptsLocked();
      } else {
        // Load current attempt count
        if (isPasswordProtected) {
          const { count } = getPasswordAttempts(shortCode);
          setPasswordAttempts(count);
          checkAttemptsLocked();
        } else {
          resolveUrl();
        }
      }
    }
  }, [shortCode, isPasswordProtected]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (isDeactivated) {
    return <DeactivatedUrlNotice />;
  }
  
  if (isPasswordProtected) {
    return (
      <PasswordProtectedForm 
        shortCode={shortCode || ''} 
        onSubmit={verifyPassword} 
        attempts={passwordAttempts}
        maxAttempts={MAX_PASSWORD_ATTEMPTS}
        attemptLocked={attemptLocked}
        lockTimeRemaining={lockTimeRemaining}
      />
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting to {originalUrl}...</p>
      </div>
    </div>
  );
};

export default Redirect;
