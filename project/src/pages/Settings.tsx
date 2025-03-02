import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Bell, Lock, Eye, EyeOff, Globe, Moon, Sun, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // Initialize settings state with defaults or user preferences
  const [settings, setSettings] = useState({
    theme: user?.settings?.theme || 'light',
    notifications: {
      email: user?.settings?.notifications?.email || false,
      browser: user?.settings?.notifications?.browser || true,
      urlClicks: user?.settings?.notifications?.urlClicks || false
    },
    privacy: {
      showProfilePublicly: user?.settings?.privacy?.showProfilePublicly || true,
      trackUrlAnalytics: user?.settings?.privacy?.trackUrlAnalytics || true
    },
    defaultUrlSettings: {
      passwordProtect: user?.settings?.defaultUrlSettings?.passwordProtect || false,
      expiresAfterDays: user?.settings?.defaultUrlSettings?.expiresAfterDays || 0,
      customMetadata: user?.settings?.defaultUrlSettings?.customMetadata || true
    }
  });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  const handleToggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };
  
  const handleNotificationChange = (key: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };
  
  const handlePrivacyChange = (key: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key as keyof typeof prev.privacy]
      }
    }));
  };
  
  const handleDefaultUrlSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      defaultUrlSettings: {
        ...prev.defaultUrlSettings,
        [key]: value
      }
    }));
  };
  
  const handleSaveSettings = () => {
    // In a real app, you would send this data to your backend
    // For now, we'll just update the local state
    const updatedUser = {
      ...user,
      settings
    };
    
    // Update user in context and localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    toast.success('Settings saved successfully!');
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // In a real app, you would send this data to your backend
    // For now, we'll just simulate success
    toast.success('Password changed successfully!');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        
        <div className="p-6">
          {/* Appearance Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Appearance</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {settings.theme === 'light' ? (
                    <Sun className="h-5 w-5 text-yellow-500 mr-3" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-500 mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Theme</p>
                    <p className="text-sm text-gray-600">Choose between light and dark mode</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleTheme}
                  className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-300"
                >
                  <span className="sr-only">Toggle theme</span>
                  <span
                    className={`${
                      settings.theme === 'dark' ? 'translate-x-6 bg-indigo-600' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email updates about your account</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.notifications.email ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle email notifications</span>
                  <span
                    className={`${
                      settings.notifications.email ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Browser Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('browser')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.notifications.browser ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle browser notifications</span>
                  <span
                    className={`${
                      settings.notifications.browser ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">URL Click Notifications</p>
                    <p className="text-sm text-gray-600">Get notified when someone clicks your URLs</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('urlClicks')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.notifications.urlClicks ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle URL click notifications</span>
                  <span
                    className={`${
                      settings.notifications.urlClicks ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Privacy Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy</h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Public Profile</p>
                    <p className="text-sm text-gray-600">Allow others to see your profile information</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('showProfilePublicly')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.privacy.showProfilePublicly ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle public profile</span>
                  <span
                    className={`${
                      settings.privacy.showProfilePublicly ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">URL Analytics</p>
                    <p className="text-sm text-gray-600">Track analytics for your shortened URLs</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('trackUrlAnalytics')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.privacy.trackUrlAnalytics ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle URL analytics</span>
                  <span
                    className={`${
                      settings.privacy.trackUrlAnalytics ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Default URL Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Default URL Settings</h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Password Protection</p>
                    <p className="text-sm text-gray-600">Require a password for all new URLs</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDefaultUrlSettingChange('passwordProtect', !settings.defaultUrlSettings.passwordProtect)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.defaultUrlSettings.passwordProtect ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle password protection</span>
                  <span
                    className={`${
                      settings.defaultUrlSettings.passwordProtect ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Custom Metadata</p>
                    <p className="text-sm text-gray-600">Enable custom metadata for social media sharing</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDefaultUrlSettingChange('customMetadata', !settings.defaultUrlSettings.customMetadata)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    settings.defaultUrlSettings.customMetadata ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle custom metadata</span>
                  <span
                    className={`${
                      settings.defaultUrlSettings.customMetadata ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                    } inline-block w-4 h-4 transform rounded-full transition-transform`}
                  />
                </button>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Globe className="h-5 w-5 text-indigo-500 mr-3" />
                  <p className="font-medium text-gray-800">URL Expiration</p>
                </div>
                <div className="ml-8">
                  <p className="text-sm text-gray-600 mb-2">Set default expiration time for new URLs</p>
                  <select
                    value={settings.defaultUrlSettings.expiresAfterDays}
                    onChange={(e) => handleDefaultUrlSettingChange('expiresAfterDays', parseInt(e.target.value))}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="0">Never expire</option>
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Change Password */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
