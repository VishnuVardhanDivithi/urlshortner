import React, { useState } from 'react';
import { Copy, ExternalLink, Calendar, BarChart2, Share2, Lock, Image, Check } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { UrlData } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { getShareableUrl } from '../services/urlService';
import ShareButton from './ShareButton';

interface UrlResultProps {
  urlData: UrlData;
  onCopy: () => void;
}

const UrlResult: React.FC<UrlResultProps> = ({ urlData, onCopy }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const shortUrlFull = getShareableUrl(urlData.shortUrl);
  
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrlFull)}`;
  
  const handleCopy = () => {
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-auto mt-6 border-l-4 border-purple-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">Your Shortened URL</h3>
        <div className="flex space-x-2">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Active
          </span>
          {urlData.hasPassword && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Password Protected
            </span>
          )}
          {urlData.hasCustomPreview && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              <Image className="h-3 w-3 mr-1" />
              Custom Preview
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
          <a 
            href={shortUrlFull} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium flex items-center hover:underline text-lg mb-3 sm:mb-0"
          >
            {shortUrlFull}
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowQR(!showQR)} 
              className="bg-indigo-100 text-indigo-700 p-2 rounded-md hover:bg-indigo-200 transition-colors"
              title="Show QR Code"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <CopyToClipboard text={shortUrlFull} onCopy={handleCopy}>
              <button 
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                title="Copy to Clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </CopyToClipboard>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 truncate">
          Original: <span className="font-medium">{urlData.originalUrl}</span>
        </p>
      </div>
      
      {showQR && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg text-center">
          <p className="text-sm font-medium mb-2">Scan this QR code to access the URL</p>
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="mx-auto" 
            width="150" 
            height="150" 
          />
          <p className="text-xs text-gray-500 mt-2">
            Share this QR code with anyone to give them access to your link
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center text-gray-500 mb-1">
            <BarChart2 className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">CLICKS</span>
          </div>
          <p className="text-lg font-semibold">{urlData.clicks}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center text-gray-500 mb-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">CREATED</span>
          </div>
          <p className="text-sm">
            {formatDistanceToNow(new Date(urlData.createdAt), { addSuffix: true })}
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center text-gray-500 mb-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">EXPIRES</span>
          </div>
          <p className="text-sm">
            {urlData.expiresAt 
              ? formatDistanceToNow(new Date(urlData.expiresAt), { addSuffix: true })
              : 'Never'}
          </p>
        </div>
      </div>
      
      {/* Security and Preview Features */}
      {(urlData.hasPassword || urlData.hasCustomPreview) && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {urlData.hasPassword && (
            <div className="bg-purple-50 p-4 rounded-md shadow-sm">
              <div className="flex items-center text-purple-800 mb-2">
                <Lock className="h-5 w-5 mr-2" />
                <h4 className="font-medium">Password Protection</h4>
              </div>
              <p className="text-sm text-purple-700">
                This link is password protected. Users will need to enter the correct password to access the destination.
              </p>
            </div>
          )}
          
          {urlData.hasCustomPreview && (
            <div className="bg-blue-50 p-4 rounded-md shadow-sm">
              <div className="flex items-center text-blue-800 mb-2">
                <Image className="h-5 w-5 mr-2" />
                <h4 className="font-medium">Custom Link Preview</h4>
              </div>
              <p className="text-sm text-blue-700">
                This link has a custom preview when shared on social media platforms.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-md text-indigo-800 text-sm shadow-sm">
        <p className="font-medium mb-1">Share this URL with anyone!</p>
        <p>When they click the link, they'll be redirected to your original URL.</p>
        <p className="mt-2 text-xs">
          <strong>Note:</strong> Make sure to share the full URL including "http://" and the port number.
        </p>
        <div className="mt-3">
          <ShareButton url={shortUrlFull} title="Check out this shortened URL!" />
        </div>
      </div>
    </div>
  );
};

export default UrlResult;