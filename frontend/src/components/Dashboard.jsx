import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, LogOut, User } from 'lucide-react';
import authService from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user info
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Streamix
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-5 h-5" />
                <span className="text-sm">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to <span className="text-red-600">Streamix</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Your personal streaming dashboard
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-600/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Login Successful!</h2>
              <p className="text-gray-300">You're now signed in to your account</p>
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-400 mb-2">Your Session Details:</p>
            <div className="space-y-1">
              <p className="text-white"><span className="text-gray-500">Email:</span> {user.email}</p>
              <p className="text-white"><span className="text-gray-500">Status:</span> <span className="text-green-400">Active</span></p>
              <p className="text-xs text-gray-500 mt-2">Token: {user.token.substring(0, 50)}...</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-gray-400 text-sm mb-2">Total Movies</h3>
            <p className="text-3xl font-bold text-white">10,000+</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-gray-400 text-sm mb-2">Watch Time</h3>
            <p className="text-3xl font-bold text-white">0 hrs</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-gray-400 text-sm mb-2">Favorites</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm p-12 rounded-2xl border border-gray-700/50 text-center">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">More Features Coming Soon!</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We're working hard to bring you an amazing streaming experience. 
            Movie catalog, personalized recommendations, and more will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
