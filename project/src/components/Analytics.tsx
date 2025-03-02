import React, { useState, useEffect, useContext } from 'react';
import { AnalyticsData } from '../types';
import { AuthContext } from '../App';
import { getCurrentUser } from '../services/urlService';

interface AnalyticsProps {
  data: AnalyticsData;
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  // Get auth context for user data
  const { user } = useContext(AuthContext);
  
  // State for tracking the current date range
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [displayData, setDisplayData] = useState(data);
  // State for tracking the selected day
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  // State for user details
  const [userDetails, setUserDetails] = useState<any>(null);
  
  // Define date ranges (each range is 7 days)
  const dateRanges = [
    { start: new Date(2025, 2, 2), end: new Date(2025, 2, 8) },  // Current week
    { start: new Date(2025, 1, 23), end: new Date(2025, 3, 1) }, // Previous week
    { start: new Date(2025, 1, 16), end: new Date(2025, 1, 22) } // Two weeks ago
  ];
  
  // Fetch user details on component mount
  useEffect(() => {
    const userData = getCurrentUser();
    setUserDetails(userData);
  }, []);
  
  // Generate consistent data for each date range
  const generateDataForRange = (rangeIndex: number) => {
    const baseClicks = {
      0: [8, 15, 12, 18, 14, 22, 10], // Current week
      1: [6, 12, 9, 14, 11, 17, 8],   // Previous week
      2: [5, 10, 8, 12, 9, 15, 7]     // Two weeks ago
    };
    
    const startDate = new Date(dateRanges[rangeIndex].start);
    const clicksByDate = Array(7).fill(0).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Format as full date (e.g., "Sun, Mar 2")
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
      
      // Get consistent clicks for this day based on the day index and range
      const clicks = baseClicks[rangeIndex as keyof typeof baseClicks][i];
      
      return { 
        date: dayName, 
        fullDate, 
        actualDate: date, 
        clicks 
      };
    });
    
    const totalClicks = clicksByDate.reduce((sum, item) => sum + item.clicks, 0);
    
    return {
      ...data,
      totalClicks,
      clicksByDate,
      userId: userDetails?._id || user?.user?._id || 'unknown'
    };
  };
  
  // Update display data when current date index changes or user details change
  useEffect(() => {
    const newData = generateDataForRange(currentDateIndex);
    setDisplayData(newData);
    
    // Update user details with the latest analytics data
    if (userDetails) {
      const updatedUserDetails = {
        ...userDetails,
        analyticsData: {
          totalClicks: newData.totalClicks,
          clicksByDate: newData.clicksByDate
        }
      };
      setUserDetails(updatedUserDetails);
      
      // You could also persist this to localStorage if needed
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.user = {
            ...userData.user,
            analyticsData: {
              totalClicks: newData.totalClicks,
              clicksByDate: newData.clicksByDate
            }
          };
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error updating user analytics in localStorage:', error);
      }
    }
    
    setSelectedDay(null); // Reset selected day when changing date range
  }, [currentDateIndex, userDetails?._id]);

  // Navigate to previous date range
  const goToPreviousRange = () => {
    if (currentDateIndex < dateRanges.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

  // Navigate to next date range
  const goToNextRange = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };

  // Get formatted date range for display
  const getFormattedDateRange = () => {
    const currentRange = dateRanges[currentDateIndex];
    const startDate = currentRange.start;
    const endDate = currentRange.end;
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Handle day click
  const handleDayClick = (dayName: string) => {
    setSelectedDay(selectedDay === dayName ? null : dayName);
  };

  // Get selected day data
  const getSelectedDayData = () => {
    if (!selectedDay) return null;
    return displayData.clicksByDate.find(item => item.date === selectedDay);
  };

  // Ensure we have valid data to prevent division by zero
  const maxClicks = Math.max(...displayData.clicksByDate.map(d => d.clicks)) || 1;
  const totalClicks = displayData.totalClicks || 1;

  // Calculate color based on percentage of max clicks
  const getBarColor = (clicks: number) => {
    const percentage = (clicks / maxClicks) * 100;
    if (percentage > 75) return 'bg-blue-400';
    if (percentage > 50) return 'bg-blue-500';
    if (percentage > 25) return 'bg-blue-600';
    return 'bg-blue-700';
  };

  // Fixed click scale for y-axis (0, 8, 16, 24)
  const clickScale = [
    { value: 0, label: '0' },
    { value: 8, label: '8' },
    { value: 16, label: '16' },
    { value: 24, label: '24' }
  ];

  return (
    <section id="analytics" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Link Performance Insights</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gain valuable insights into your link performance with your personalized analytics dashboard.
          </p>
          <div className="mt-4 inline-flex items-center bg-indigo-50 rounded-lg p-2">
            <button 
              onClick={goToPreviousRange} 
              className="p-1 rounded-md hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentDateIndex >= dateRanges.length - 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="px-3 font-medium text-indigo-700">{getFormattedDateRange()}</span>
            <button 
              onClick={goToNextRange} 
              className="p-1 rounded-md hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentDateIndex <= 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {userDetails && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg inline-block">
              <p className="text-indigo-700">
                <span className="font-medium">User:</span> {userDetails.name || userDetails.email}
              </p>
              {userDetails.analyticsData && (
                <p className="text-indigo-700 text-sm mt-1">
                  <span className="font-medium">Total Clicks:</span> {userDetails.analyticsData.totalClicks}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
          {/* Click Performance Chart - Updated to vertical bar chart with dark theme */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Click Performance</h3>
            <div className="bg-gray-900 rounded-lg p-6 shadow-inner">
              {/* Chart header with clickable day names */}
              <div className="flex justify-between items-center mb-6 px-1">
                {displayData.clicksByDate.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayClick(item.date)}
                    className={`text-xs font-medium ${
                      selectedDay === item.date ? 'text-indigo-400' : 'text-gray-400'
                    } hover:text-indigo-300 transition-colors`}
                    title={item.fullDate}
                  >
                    {item.fullDate}
                  </button>
                ))}
              </div>
              
              {/* Y-axis scale */}
              <div className="flex h-48 relative">
                <div className="flex flex-col justify-between h-full pr-2">
                  {clickScale.map((scale, index) => (
                    <div key={index} className="text-xs text-gray-500 flex items-center h-6">
                      {scale.label}
                    </div>
                  ))}
                </div>
                
                {/* Horizontal grid lines */}
                <div className="flex-1 relative">
                  {clickScale.map((scale, index) => (
                    <div
                      key={index}
                      className="absolute w-full border-t border-gray-800"
                      style={{
                        bottom: `${(scale.value / 24) * 100}%`,
                        height: '1px'
                      }}
                    />
                  ))}
                  
                  {/* Bars */}
                  <div className="flex justify-between h-full items-end">
                    {displayData.clicksByDate.map((item, index) => (
                      <div
                        key={index}
                        className="relative flex flex-col items-center group"
                        style={{ width: `${100 / displayData.clicksByDate.length}%` }}
                      >
                        <div
                          className={`w-6 ${getBarColor(item.clicks)} rounded-t transition-all duration-300 ${
                            selectedDay === item.date ? 'opacity-100' : 'opacity-70'
                          } hover:opacity-100`}
                          style={{
                            height: `${Math.min((item.clicks / 24) * 100, 100)}%`,
                            minHeight: '4px'
                          }}
                        />
                        
                        {/* Tooltip */}
                        {selectedDay === item.date && (
                          <div className="absolute bottom-full mb-2 bg-white text-gray-900 text-xs font-medium py-1 px-2 rounded shadow-lg">
                            {item.clicks} clicks
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Date navigation */}
              <div className="flex justify-between items-center mt-6 text-gray-400">
                <button
                  onClick={goToPreviousRange}
                  className={`text-sm ${
                    currentDateIndex < dateRanges.length - 1
                      ? 'text-indigo-400 hover:text-indigo-300'
                      : 'text-gray-700 cursor-not-allowed'
                  }`}
                  disabled={currentDateIndex >= dateRanges.length - 1}
                >
                  ← Previous Week
                </button>
                <span className="text-sm text-gray-300">Week ending {getFormattedDateRange()}</span>
                <button
                  onClick={goToNextRange}
                  className={`text-sm ${
                    currentDateIndex > 0
                      ? 'text-indigo-400 hover:text-indigo-300'
                      : 'text-gray-700 cursor-not-allowed'
                  }`}
                  disabled={currentDateIndex <= 0}
                >
                  Next Week →
                </button>
              </div>
            </div>
          </div>
          
          {/* Selected Day Details */}
          {selectedDay && (
            <div className="bg-indigo-50 p-4 rounded-lg mb-8">
              <h3 className="text-lg font-bold text-indigo-800 mb-2">
                {getSelectedDayData()?.fullDate || selectedDay} Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-gray-500 text-xs">Clicks</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {getSelectedDayData()?.clicks || 0}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-gray-500 text-xs">% of Total</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {Math.round(((getSelectedDayData()?.clicks || 0) / totalClicks) * 100)}%
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-gray-500 text-xs">Top Referrer</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {displayData.referrers[0]?.source || 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Referrer & Device Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Referrer Breakdown</h3>
              <div className="space-y-3">
                {displayData.referrers.map((referrer, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">{referrer.source}</span>
                      <span className="text-indigo-600 font-medium">{referrer.count} clicks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(referrer.count / totalClicks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {displayData.devices.map((device, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">{device.type}</span>
                      <span className="text-indigo-600 font-medium">{device.count} clicks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(device.count / totalClicks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;