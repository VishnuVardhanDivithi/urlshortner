import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { User, Mail, Key, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // Initialize form state with user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    company: user?.company || '',
    location: user?.location || ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your backend
    // For now, we'll just update the local state
    const updatedUser = {
      ...user,
      ...formData
    };
    
    // Update user in context and localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        </div>
        
        <div className="p-6">
          {/* Profile header with avatar */}
          <div className="flex flex-col sm:flex-row items-center mb-8">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
              <User className="w-12 h-12 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-gray-600">{user?.email || 'No email provided'}</p>
              {user?.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
              
              <div className="mt-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your company"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your location"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500 font-medium mb-2">Personal Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {user?.company && (
                    <div className="mb-3">
                      <span className="font-medium text-gray-700">Company:</span>
                      <span className="ml-2 text-gray-800">{user.company}</span>
                    </div>
                  )}
                  
                  {user?.location && (
                    <div className="mb-3">
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-800">{user.location}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-700">Member since:</span>
                    <span className="ml-2 text-gray-800">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-500 font-medium mb-2">Account Statistics</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-3">
                    <span className="font-medium text-gray-700">URLs Created:</span>
                    <span className="ml-2 text-gray-800">{user?.urlsCreated || 0}</span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium text-gray-700">Total Clicks:</span>
                    <span className="ml-2 text-gray-800">{user?.totalClicks || 0}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Account Type:</span>
                    <span className="ml-2 text-gray-800">{user?.accountType || 'Free'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
