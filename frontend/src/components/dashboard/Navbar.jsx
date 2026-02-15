import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Play } from 'lucide-react';
import authService from '../../services/authService';
import movieService from '../../services/movieService';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null); // Ref for click outside
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const inputRef = useRef(null);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        // Optional: Clear results if you want them gone too
        // setSearchResults([]); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search Logic - searches BOTH movies and TV shows
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          // Search both movies and TV shows in parallel
          const [movieResults, tvResults] = await Promise.all([
            movieService.searchMovies(searchQuery).catch(() => []),
            movieService.searchTVShows(searchQuery).catch(() => [])
          ]);

          // Combine and mark type, then limit
          const combined = [
            ...movieResults.map(m => ({ ...m, type: m.type || 'movie' })),
            ...tvResults.map(t => ({ ...t, type: 'tv' }))
          ];

          // Deduplicate by id
          const seen = new Set();
          const unique = combined.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

          setSearchResults(unique.slice(0, 8)); // Limit to 8 results
        } catch (error) {
          console.error("Navbar: Search failed", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchResults([]); // Clear dropdown
    }
  };

  const handleResultClick = (movie) => {
    const typeSuffix = movie.type === 'tv' ? '?type=tv' : '';
    navigate(`/movie/${movie.id}${typeSuffix}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

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

  const navLinks = ['Home', 'Series', 'Movies', 'My List'];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/95 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* LEFT: Logo & Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link
              to="/dashboard"
              onClick={() => setActiveTab('Home')}
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center transform group-hover:scale-110 transition duration-300">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Streamix
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    if (window.location.pathname !== '/dashboard') {
                      navigate('/dashboard', { state: { tab: item } });
                    }
                  }}
                  className={`relative text-sm font-medium transition duration-300 pb-1 ${activeTab === item
                    ? 'text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  {item}
                  {activeTab === item && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Search & Profile */}
          <div className="flex items-center space-x-6">



            {/* Search Bar (Expandable) */}
            <div
              ref={searchRef}
              className={`relative flex items-center transition-all duration-300 ${isSearchOpen
                ? 'bg-black/80 border border-gray-600 px-3 py-1.5 w-64'
                : 'w-10 justify-center'
                } ${searchResults.length > 0 && isSearchOpen ? 'rounded-t-lg rounded-b-none' : 'rounded-full'}`}
            >
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-200 hover:text-white focus:outline-none"
              >
                <Search className="w-5 h-5" />
              </button>
              <form onSubmit={handleSearchSubmit} className={`flex-1 ${isSearchOpen ? 'block' : 'hidden'}`}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-full ml-2"
                />
              </form>

              {/* Search Suggestions Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-black/95 border border-t-0 border-gray-600 rounded-b-lg shadow-xl overflow-hidden z-50">
                  {searchResults.map(movie => (
                    <div
                      key={movie.id}
                      onClick={() => handleResultClick(movie)}
                      className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex items-center space-x-3 transition border-b border-gray-800 last:border-0"
                    >
                      <img
                        src={movie.posterUrl || `https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-8 h-12 object-cover rounded"
                      />
                      <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold text-white truncate">{movie.title || movie.name}</p>
                        <p className="text-xs text-gray-400">
                          {(movie.releaseDate || movie.firstAirDate || movie.release_date || "")?.split('-')[0] || ""}
                        </p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${movie.type === 'tv' ? 'bg-blue-600/30 text-blue-400' : 'bg-red-600/30 text-red-400'}`}>
                        {movie.type === 'tv' ? 'Series' : 'Movie'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
    </nav >
  );
};

export default Navbar;
