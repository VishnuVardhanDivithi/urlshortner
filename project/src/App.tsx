import React, { useState, useEffect, createContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import UrlForm from './components/UrlForm';
import UrlResult from './components/UrlResult';
import Features from './components/Features';
import Analytics from './components/Analytics';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import ErrorBoundary from './components/ErrorBoundary';
import Debug from './components/Debug';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Redirect from './components/Redirect';
import { UrlData, UrlFormData } from './types';
import { createShortUrl, getAnalytics, getAllUrls, getShareableUrl, updateBaseUrls } from './services/urlService';
import axios from 'axios';

// Create authentication context
export interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false
});

function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [urlData, setUrlData] = useState<UrlData | null>(null);
  const [allUrls, setAllUrls] = useState<UrlData[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalClicks: 0,
    clicksByDate: [
      { date: 'Mon', clicks: 0 },
      { date: 'Tue', clicks: 0 },
      { date: 'Wed', clicks: 0 },
      { date: 'Thu', clicks: 0 },
      { date: 'Fri', clicks: 0 },
      { date: 'Sat', clicks: 0 },
      { date: 'Sun', clicks: 0 }
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
    ]
  });

  // Fetch all URLs and analytics when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch URLs
        const urls = await getAllUrls();
        setAllUrls(urls);
        
        // Fetch analytics
        try {
          const analytics = await getAnalytics();
          console.log('Fetched analytics:', analytics);
          if (analytics) {
            setAnalyticsData(analytics);
          }
        } catch (analyticsError) {
          console.error('Error fetching analytics:', analyticsError);
          // Keep using default analytics data if fetch fails
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData: UrlFormData) => {
    setIsLoading(true);
    try {
      console.log('Submitting URL form data:', formData);
      // Don't reference API_BASE_URL directly as it's not imported
      
      const data = await createShortUrl(formData);
      console.log('Received shortened URL data:', data);
      
      setUrlData(data);
      toast.success('URL shortened successfully!');
      
      // Refresh the list of URLs
      const urls = await getAllUrls();
      setAllUrls(urls);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      // Provide more specific error messages based on the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data.message || 'Server error. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(error.message || 'Failed to shorten URL. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    toast.success('URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Shorten, Share, Track
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                Create shortened URLs with powerful analytics and customization options.
              </p>
            </div>
            
            <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
            
            {urlData && <UrlResult urlData={urlData} onCopy={handleCopy} />}
          </div>
        </section>
        
        {/* All URLs Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">All Shortened URLs</h2>
            
            {allUrls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Original URL</th>
                      <th className="py-2 px-4 border-b text-left">Short URL</th>
                      <th className="py-2 px-4 border-b text-left">Created At</th>
                      <th className="py-2 px-4 border-b text-left">Clicks</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUrls.map((url) => (
                      <tr key={url._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b truncate max-w-xs">
                          <a 
                            href={url.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {url.originalUrl}
                          </a>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <a 
                            href={getShareableUrl(url.shortUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {url.shortUrl}
                          </a>
                        </td>
                        <td className="py-2 px-4 border-b">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">{url.clicks}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs ${url.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {url.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500">No URLs found. Create your first shortened URL above!</p>
            )}
          </div>
        </section>
        
        <Features />
        <Analytics data={analyticsData} />
        <FAQ />
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing user session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  // Update base URLs when app initializes
  useEffect(() => {
    updateBaseUrls();
  }, []);

  const isAuthenticated = !!user;

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
      <ErrorBoundary>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/dashboard" element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />
                } />
                <Route path="/profile" element={
                  isAuthenticated ? <Profile /> : <Navigate to="/signin" />
                } />
                <Route path="/settings" element={
                  isAuthenticated ? <Settings /> : <Navigate to="/signin" />
                } />
                <Route path="/debug" element={<Debug />} />
                <Route path="/:shortCode" element={<Redirect />} />
              </Routes>
            </div>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

export default App;