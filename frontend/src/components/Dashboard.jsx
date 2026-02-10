import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import movieService from '../services/movieService';
import interactionService from '../services/interactionService';
import Navbar from './dashboard/Navbar';
import HeroSection from './dashboard/HeroSection';
import MovieRow from './dashboard/MovieRow';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]); // Store all movies
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Home"); // Default tab

  const [watchlist, setWatchlist] = useState([]); // Store watchlist movie IDs

  // Categories to display
  const categories = ["Action", "Sci-Fi", "Comedy", "Horror", "Drama", "Romance", "Movie"];

  useEffect(() => {
    // 1. Auth Check
    const currentUser = authService.getCurrentUser();
    if (!currentUser.token) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // 2. Fetch Movies
    const fetchData = async () => {
      setLoading(true);
      try {
        const [moviesData, watchlistData] = await Promise.all([
          movieService.getAllMovies(),
          currentUser.id ? interactionService.getWatchlist(currentUser.id) : Promise.resolve([])
        ]);

        if (moviesData && moviesData.length > 0) {
          setMovies(moviesData);
        } else {
          setMovies(mockMovies);
        }

        if (watchlistData) {
          // watchlistData is array of { movieId: 123, ... }
          const ids = watchlistData.map(item => item.movieId);
          setWatchlist(ids);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
        setMovies(mockMovies);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Helper to filter movies by category
  const getMoviesByCategory = (cat) => {
    return movies.filter(m => m.category === cat || (cat === "Trending" && m.id % 2 === 0));
  };

  // Filter content based on Active Tab
  const getFilteredContent = () => {
    if (activeTab === "Series") {
      return movies.filter(m => m.category === "Series" || m.title.includes("Series"));
    }
    if (activeTab === "Movies") {
      return movies.filter(m => m.category !== "Series");
    }
    if (activeTab === "New & Popular") {
      return movies.slice(0, 5);
    }
    if (activeTab === "My List") {
      return movies.filter(m => watchlist.includes(m.id));
    }
    return movies; // "Home"
  };

  if (!user) return null;

  // Select a featured movie (Random or first)
  const featuredMovie = movies.length > 0
    ? movies[Math.floor(Math.random() * movies.length)]
    : null;

  const handlePlay = () => {
    console.log("Play button clicked");
    // Future: Navigate to player
    alert("Playing movie: " + (featuredMovie?.title || "Unknown"));
  };

  const handleMoreInfo = () => {
    if (featuredMovie) {
      navigate(`/movie/${featuredMovie.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Section - Hide on "My List" */}
      {activeTab !== "My List" && (
        <HeroSection
          featuredMovie={featuredMovie}
          onPlay={handlePlay}
          onMoreInfo={handleMoreInfo}
        />
      )}

      {/* Content Layers - Removed negative margin to prevent overlap issues stated by user */}
      <div className={`relative z-10 pb-20 space-y-8 px-4 md:px-0 bg-[#141414] ${activeTab === "My List" ? "pt-24" : "pb-20"}`}>


        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading Streamix...</p>
          </div>
        ) : (
          <>
            {/* Always show a "Trending" or "All" row first */}
            <MovieRow
              title={activeTab === "Home" ? "Trending Now" : `Top ${activeTab}`}
              movies={getFilteredContent().slice(0, 10)}
              onMovieClick={(m) => navigate(`/movie/${m.id}`)}
            />

            {/* Map through categories if on Home, otherwise show relevant content */}
            {activeTab === "Home" && categories.map((cat) => {
              const catMovies = getMoviesByCategory(cat);
              if (catMovies.length === 0) return null; // Don't show empty rows

              return (
                <MovieRow
                  key={cat}
                  title={`${cat} Movies`}
                  movies={catMovies}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

// Robust Mock Data with TMDB style paths
const mockMovies = [
  { id: 1, title: "Stranger Things", poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", backdrop_path: "/56v2KjBlU4XaOv9rVYkJu64j4ih.jpg", category: "Sci-Fi", overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.", vote_average: 8.6, release_date: "2016-07-15" },
  { id: 2, title: "Avengers: Endgame", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", category: "Action", overview: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.", vote_average: 8.3, release_date: "2019-04-24" },
  { id: 3, title: "The Witcher", poster_path: "/7vjaCdMW15FEbXyWWTVaCp33tXV.jpg", backdrop_path: "/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg", category: "Fantasy", overview: "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.", vote_average: 8.2, release_date: "2019-12-20" },
  { id: 4, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", category: "Sci-Fi", overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.", vote_average: 8.4, release_date: "2010-07-15" },
  { id: 5, title: "Dark", poster_path: "/apbrbWs8M9lyOpJYU5WXkFbkqMZ.jpg", backdrop_path: "/3lBDg3i6nn5R2NKkNgmQmVgOhAR.jpg", category: "Mystery", overview: "A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations.", vote_average: 8.4, release_date: "2017-12-01" },
  { id: 6, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", category: "Sci-Fi", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.", vote_average: 8.4, release_date: "2014-11-05" },
  { id: 7, title: "Parasite", poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdrop_path: "/hiKmpZMGZsrkA3cdce8a7DwyQP2.jpg", category: "Drama", overview: "All-unemployed Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.", vote_average: 8.5, release_date: "2019-05-30" },
];

export default Dashboard;
