import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Play } from 'lucide-react';
import authService from '../../services/authService';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/95 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* LEFT: Logo & Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center transform group-hover:scale-110 transition duration-300">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Streamix
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6">
              {['Home', 'Series', 'Movies', 'New & Popular', 'My List'].map((item) => (
                <Link
                  key={item}
                  to="#"
                  className="text-sm font-medium text-gray-300 hover:text-white transition duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Search & Profile */}
          <div className="flex items-center space-x-6">
            
            {/* Search Bar (Expandable) */}
            <div className={`flex items-center border-white/20 transition-all duration-300 ${isSearchOpen ? 'bg-black/50 border border-gray-600 px-3 py-1 rounded-full' : ''}`}>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-200 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Titles, people, genres"
                className={`bg-transparent text-sm text-white placeholder-gray-400 outline-none transition-all duration-300 ${
                  isSearchOpen ? 'w-48 ml-2' : 'w-0'
                }`}
              />
            </div>

            {/* Notification */}
            <button className="text-gray-200 hover:text-white transition">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Dropdown (Simplified) */}
            <div className="group relative flex items-center cursor-pointer">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-white transition">
                 {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-gray-800 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <div className="py-2 px-4 border-b border-gray-800">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm text-white truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-900 flex items-center space-x-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out of Streamix</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
