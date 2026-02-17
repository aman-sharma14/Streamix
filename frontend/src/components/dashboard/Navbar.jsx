import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Play } from 'lucide-react';
import authService from '../../services/authService';
import movieService from '../../services/movieService';

const Navbar = ({ activeTab, setActiveTab, isScrolledProp }) => {
  const [internalIsScrolled, setInternalIsScrolled] = useState(false);
  const isScrolled = isScrolledProp !== undefined ? isScrolledProp : internalIsScrolled;
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
    if (isScrolledProp !== undefined) return;

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setInternalIsScrolled(true);
      } else {
        setInternalIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolledProp]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navLinks = ['Home', 'Series', 'Movies', 'My List'];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/60 backdrop-blur-md border-b border-white/5' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20 relative">

          {/* LEFT: Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/dashboard"
              onClick={() => setActiveTab('Home')}
              className="flex items-center group"
            >
              <img
                src="/images/logo.png"
                alt="Streamix"
                className="h-8 w-auto object-contain transition duration-300 transform group-hover:scale-105"
                style={{ mixBlendMode: 'screen' }}
              />
            </Link>
          </div>

          {/* CENTER: Tab Bar Items */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-12 bg-black/20 backdrop-blur-sm px-10 py-3 rounded-full border border-white/5 shadow-lg">
            {navLinks.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveTab(item);
                  if (window.location.pathname !== '/dashboard') {
                    navigate('/dashboard', { state: { tab: item } });
                  }
                }}
                className={`relative text-sm tracking-wide transition-all duration-300 pb-1 ${activeTab === item
                  ? 'text-white font-bold'
                  : 'text-gray-400 hover:text-white font-medium'
                  }`}
              >
                {item}
                {activeTab === item && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>
            ))}
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
                className="text-gray-200 hover:text-white focus:outline-none transition-colors"
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

            {/* User Dropdown (Simplified) */}
            <div className="group relative flex items-center cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/20 group-hover:border-white transition overflow-hidden">
                {/* Placeholder Avatar or Initials */}
                <span className="text-sm font-bold text-white">{user.email ? user.email[0].toUpperCase() : 'U'}</span>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-4 w-56 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <div className="py-3 px-4 border-b border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                  <p className="text-sm text-white font-medium truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-3 transition first:rounded-t-lg last:rounded-b-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
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
