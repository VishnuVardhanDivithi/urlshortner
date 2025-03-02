import React, { useState } from 'react';
import { Calendar, Link, Zap, AlertTriangle, Loader2, Lock, Image, Eye, EyeOff } from 'lucide-react';
import { UrlFormData } from '../types';
import { toast } from 'react-hot-toast';
import { validateUrl, isMaliciousUrl } from '../services/urlValidationService';

interface UrlFormProps {
  onSubmit: (data: UrlFormData) => void;
  isLoading: boolean;
}

const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UrlFormData>({
    originalUrl: '',
    customAlias: '',
  });
  const [expirationDays, setExpirationDays] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' | '' }>({
    text: '',
    type: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation message
    setValidationMessage({ text: '', type: '' });
    
    // Validate URL before submitting
    if (!formData.originalUrl) {
      toast.error('Please enter a URL to shorten');
      return;
    }
    
    // Create a copy of the form data
    const data = { ...formData };
    
    // Add protocol if missing
    if (data.originalUrl && !data.originalUrl.startsWith('http://') && !data.originalUrl.startsWith('https://')) {
      data.originalUrl = 'https://' + data.originalUrl;
    }
    
    // Validate the URL
    setValidationLoading(true);
    try {
      const validation = await validateUrl(data.originalUrl);
      
      if (!validation.isValid) {
        setValidationMessage({ text: validation.message, type: 'error' });
        toast.error(validation.message);
        setValidationLoading(false);
        return;
      }
      
      // Check if URL might be malicious
      if (isMaliciousUrl(data.originalUrl)) {
        setValidationMessage({ 
          text: 'This URL appears to be potentially malicious. Please verify before proceeding.', 
          type: 'warning' 
        });
        const proceed = window.confirm(
          'Warning: This URL appears to be potentially malicious or phishing-related. Are you sure you want to proceed?'
        );
        
        if (!proceed) {
          setValidationLoading(false);
          return;
        }
      }
      
      // Handle expiration
      if (expirationDays) {
        const days = parseInt(expirationDays, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        data.expiresAt = expiresAt.toISOString();
      }
      
      console.log('Submitting form data:', data);
      onSubmit(data);
    } catch (error) {
      console.error('Error validating URL:', error);
      toast.error('Error validating URL. Please try again.');
    } finally {
      setValidationLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset validation message when URL changes
    if (name === 'originalUrl') {
      setValidationMessage({ text: '', type: '' });
    }
  };

  // Validate URL on blur
  const handleUrlBlur = async () => {
    if (!formData.originalUrl) return;
    
    let urlToCheck = formData.originalUrl;
    // Add protocol if missing
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck;
    }
    
    setValidationLoading(true);
    try {
      const validation = await validateUrl(urlToCheck);
      
      if (!validation.isValid) {
        setValidationMessage({ text: validation.message, type: 'error' });
      } else if (isMaliciousUrl(urlToCheck)) {
        setValidationMessage({ 
          text: 'This URL appears to be potentially malicious. Please verify before proceeding.', 
          type: 'warning' 
        });
      } else {
        setValidationMessage({ text: 'URL is valid', type: 'success' });
      }
    } catch (error) {
      console.error('Error validating URL on blur:', error);
    } finally {
      setValidationLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700">
            Enter a long URL to shorten
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <Link className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="originalUrl"
              name="originalUrl"
              value={formData.originalUrl}
              onChange={handleChange}
              onBlur={handleUrlBlur}
              placeholder="https://example.com/very/long/url"
              className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                validationMessage.type === 'error' 
                  ? 'border-red-300 focus:ring-red-500' 
                  : validationMessage.type === 'warning'
                  ? 'border-yellow-300 focus:ring-yellow-500'
                  : validationMessage.type === 'success'
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {validationLoading && (
              <div className="absolute right-3 top-3 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </div>
          
          {validationMessage.text && (
            <div className={`text-sm flex items-center mt-1 ${
              validationMessage.type === 'error' 
                ? 'text-red-600' 
                : validationMessage.type === 'warning'
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}>
              {validationMessage.type === 'error' || validationMessage.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 mr-1" />
              ) : (
                <Zap className="h-4 w-4 mr-1" />
              )}
              {validationMessage.text}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 flex items-center">
                <Link className="h-4 w-4 mr-1" />
                Custom Alias (Optional)
              </label>
              <input
                type="text"
                id="customAlias"
                name="customAlias"
                value={formData.customAlias}
                onChange={handleChange}
                placeholder="e.g., my-brand"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                Create a custom short link that reflects your brand
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="expirationDays" className="block text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Expiration (Optional)
              </label>
              <input
                type="number"
                id="expirationDays"
                name="expirationDays"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                min="1"
                max="365"
                placeholder="Days until expiration"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                Set an expiration date for your short link (default: 30 days)
              </p>
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Password Protection (Optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  placeholder="Enter a password"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Require a password to access your shortened link
              </p>
            </div>

            {/* Link Preview Settings */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Image className="h-4 w-4 mr-1" />
                  Custom Link Preview
                </label>
                <button
                  type="button"
                  onClick={() => setShowLinkPreview(!showLinkPreview)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showLinkPreview ? 'Hide' : 'Show'} Preview Options
                </button>
              </div>
              
              {showLinkPreview && (
                <div className="space-y-3 p-3 bg-white rounded border border-gray-200">
                  <div>
                    <label htmlFor="previewTitle" className="block text-xs font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="previewTitle"
                      name="previewTitle"
                      value={formData.previewTitle || ''}
                      onChange={handleChange}
                      placeholder="Custom preview title"
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="previewDescription" className="block text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="previewDescription"
                      name="previewDescription"
                      value={formData.previewDescription || ''}
                      onChange={handleChange}
                      placeholder="Custom preview description"
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="previewImage" className="block text-xs font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="text"
                      id="previewImage"
                      name="previewImage"
                      value={formData.previewImage || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-500">
                      Custom previews appear when your link is shared on social media platforms
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || validationLoading}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
            isLoading || validationLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Shortening...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Shorten URL
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UrlForm;