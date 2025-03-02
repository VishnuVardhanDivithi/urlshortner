import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, X } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  url, 
  title = 'Check out this link!', 
  text = 'I shortened this URL with LinkShrink' 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  
  // Function to handle sharing
  const handleShare = async () => {
    try {
      // Check if the Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
      } else {
        // Toggle share options if Web Share API is not available
        setShowOptions(!showOptions);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to showing options if sharing fails
      setShowOptions(!showOptions);
    }
  };

  // Function to copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard! You can now paste and share it.');
      setShowOptions(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Social sharing URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
        title="Share this URL"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>
      
      {showOptions && (
        <div className="absolute mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Share via</span>
            <button 
              onClick={() => setShowOptions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <a 
              href={facebookShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 text-blue-600"
              title="Share on Facebook"
            >
              <Facebook className="h-5 w-5" />
              <span className="text-xs mt-1">Facebook</span>
            </a>
            
            <a 
              href={twitterShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 text-blue-400"
              title="Share on Twitter"
            >
              <Twitter className="h-5 w-5" />
              <span className="text-xs mt-1">Twitter</span>
            </a>
            
            <a 
              href={linkedinShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 text-blue-700"
              title="Share on LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
              <span className="text-xs mt-1">LinkedIn</span>
            </a>
            
            <a 
              href={mailtoUrl}
              className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
              title="Share via Email"
            >
              <Mail className="h-5 w-5" />
              <span className="text-xs mt-1">Email</span>
            </a>
          </div>
          
          <button
            onClick={copyToClipboard}
            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 font-medium transition-colors"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
