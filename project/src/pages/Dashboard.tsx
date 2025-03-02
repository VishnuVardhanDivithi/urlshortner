import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, PieChart, LineChart, Clipboard, ExternalLink, Calendar, Edit, Trash2, Eye, User, Power } from 'lucide-react';
import { AuthContext } from '../App';
import { UrlData } from '../types';
import { getAllUrls, getAnalytics, getShareableUrl, getCurrentUser, deactivateUrl, activateUrl } from '../services/urlService';
import { toast } from 'react-hot-toast';
import Analytics from '../components/Analytics';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('urls');
  const [userDetails, setUserDetails] = useState<any>(null);
  
  // Get current date and previous dates for the last week
  const today = new Date();
  const dates = Array(7).fill(0).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const [analyticsData, setAnalyticsData] = useState({
    totalClicks: 0,
    clicksByDate: [
      { date: dates[0], clicks: 0 },
      { date: dates[1], clicks: 0 },
      { date: dates[2], clicks: 0 },
      { date: dates[3], clicks: 0 },
      { date: dates[4], clicks: 0 },
      { date: dates[5], clicks: 0 },
      { date: dates[6], clicks: 0 }
    ],
    referrers: [
      { source: 'Direct', count: 0 },
      { source: 'Twitter', count: 0 },
      { source: 'Facebook', count: 0 },
      { source: 'LinkedIn', count: 0 }
    ],
    devices: [
      { type: 'Mobile', count: 0 },
      { type: 'Desktop', count: 0 },
      { type: 'Tablet', count: 0 }
    ],
    userId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user details
        const currentUser = getCurrentUser();
        setUserDetails(currentUser);
        
        // Fetch URLs
        const fetchedUrls = await getAllUrls();
        
        // Filter URLs to only show those belonging to the current user
        const userUrls = currentUser ? 
          fetchedUrls.filter(url => url.userId === currentUser._id) : 
          fetchedUrls;
          
        setUrls(userUrls);
        
        // Fetch analytics
        try {
          const analytics = await getAnalytics();
          if (analytics) {
            // Ensure analytics are for the current user
            if (currentUser && analytics.userId && analytics.userId !== currentUser._id) {
              console.warn('Analytics data does not match current user');
              // Generate user-specific analytics based on their URLs
              const totalClicks = userUrls.reduce((sum, url) => sum + url.clicks, 0);
              
              // Update analytics with user-specific data
              setAnalyticsData({
                ...analytics,
                totalClicks,
                userId: currentUser._id
              });
            } else {
              setAnalyticsData(analytics);
            }
          }
        } catch (analyticsError) {
          console.error('Error fetching analytics:', analyticsError);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy');
      });
  };
  
  const handleDeactivateUrl = async (shortCode: string) => {
    try {
      await deactivateUrl(shortCode);
      // Update the URLs list
      setUrls(urls.map(url => 
        url.shortUrl === shortCode ? { ...url, isActive: false } : url
      ));
      toast.success('URL deactivated successfully');
    } catch (error) {
      console.error('Error deactivating URL:', error);
      toast.error('Failed to deactivate URL');
    }
  };

  const handleActivateUrl = async (shortCode: string) => {
    try {
      await activateUrl(shortCode);
      // Update the URLs list
      setUrls(urls.map(url => 
        url.shortUrl === shortCode ? { ...url, isActive: true } : url
      ));
      toast.success('URL activated successfully');
    } catch (error) {
      console.error('Error activating URL:', error);
      toast.error('Failed to activate URL');
    }
  };

  const toggleUrlStatus = async (url: UrlData) => {
    if (url.isActive) {
      await handleDeactivateUrl(url.shortUrl);
    } else {
      await handleActivateUrl(url.shortUrl);
    }
  };

  const renderUrlTable = () => {
    if (urls.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No URLs found. Create your first shortened URL!</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Create URL
          </Link>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {urls.map((url) => {
              const createdDate = new Date(url.createdAt);
              const formattedDate = createdDate.toLocaleDateString();
              const shareableUrl = getShareableUrl(url.shortUrl);
              
              return (
                <tr key={url._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {url.originalUrl}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <a 
                        href={shareableUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-900 truncate max-w-xs flex items-center"
                      >
                        {shareableUrl}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(shareableUrl)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Clipboard size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{url.clicks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formattedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      url.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {url.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {url.hasPassword && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Protected
                      </span>
                    )}
                    {url.hasCustomPreview && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Custom Preview
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Analytics"
                      >
                        <BarChart size={16} />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit URL"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={`${url.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={url.isActive ? 'Deactivate URL' : 'Activate URL'}
                        onClick={() => toggleUrlStatus(url)}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your shortened URLs and view analytics</p>
        </div>
        
        {/* User Profile Summary */}
        {userDetails && (
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm mt-4 md:mt-0">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User size={24} className="text-indigo-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">
                  {userDetails.name || 'User'}
                </h3>
                <p className="text-xs text-indigo-600">{userDetails.email}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-indigo-100">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-600">Total URLs:</span>
                <span className="font-medium">{urls.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-indigo-600">Total Clicks:</span>
                <span className="font-medium">{analyticsData.totalClicks}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'urls'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('urls')}
          >
            My URLs
          </button>
          <button
            className={`${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'urls' && renderUrlTable()}
          
          {activeTab === 'analytics' && (
            <Analytics data={analyticsData} />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
