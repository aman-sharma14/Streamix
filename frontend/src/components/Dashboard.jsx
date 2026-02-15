import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import movieService from '../services/movieService';
import interactionService from '../services/interactionService';
import Navbar from './dashboard/Navbar';
import HeroSection from './dashboard/HeroSection';
import MovieRow from './dashboard/MovieRow';
import MovieCard from './dashboard/MovieCard';
import SectionHeader from './dashboard/SectionHeader';
import GenreFilter from './dashboard/GenreFilter';
import GenreCarousel from './dashboard/GenreCarousel';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Handle Tab Switch via Query Param
  useEffect(() => {
    if (location.state?.tab && ["Home", "Series", "Movies", "My List"].includes(location.state.tab)) {
      setActiveTab(location.state.tab);
    }
  }, [location]);
  const [movies, setMovies] = useState([]); // Store all movies
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Home"); // Default tab
  const [watchlist, setWatchlist] = useState([]); // Store watchlist movie IDs
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [selectedGenreName, setSelectedGenreName] = useState(null);
  const [genres, setGenres] = useState([]);


  useEffect(() => {
    // 1. Auth Check
    const currentUser = authService.getCurrentUser();
    if (!currentUser.token) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // 2. Fetch Movies and TV Shows from multiple endpoints
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          trendingMovies,
          popularMovies,
          topRatedMovies,
          trendingTV,
          popularTV,
          topRatedTV,
          watchlistData,
          genresData
        ] = await Promise.all([
          movieService.getTrendingMovies(),
          movieService.getPopularMovies(),
          movieService.getTopRatedMovies(),
          movieService.getTrendingTVShows(),
          movieService.getPopularTVShows(),
          movieService.getTopRatedTVShows(),
          currentUser.id ? interactionService.getWatchlist(currentUser.id) : Promise.resolve([]),
          movieService.getGenres()
        ]);

        setGenres(genresData.genres || []); // Assuming response structure

        // Combine all content and deduplicate by id
        const allContentRaw = [
          ...trendingMovies,
          ...popularMovies,
          ...topRatedMovies,
          ...trendingTV,
          ...popularTV,
          ...topRatedTV
        ];
        const seen = new Set();
        const allContent = allContentRaw.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        setMovies(allContent.length > 0 ? allContent : mockMovies);

        if (watchlistData) {
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

      {/* Headers based on Active Tab */}
      {activeTab === "Home" && (
        <HeroSection
          featuredMovie={featuredMovie}
          onPlay={handlePlay}
          onMoreInfo={handleMoreInfo}
        />
      )}

      {activeTab === "Movies" && (
        <SectionHeader
          title="Movies"
          description="Movies move us like nothing else can, whether they’re scary, funny, dramatic, romantic or anywhere in-between."
          image="https://assets.nflxext.com/ffe/siteui/vlv3/dace47b4-a5cb-4368-80fe-c26f3e77d540/f5b52435-458f-498f-9d1d-ccd4f1af9913/IN-en-20231023-popsignuptwoweeks-perspective_alpha_website_large.jpg"
        />
      )}

      {activeTab === "Series" && (
        <SectionHeader
          title="TV Series"
          description="Binge-worthy shows from around the world."
          image="https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg" // Breaking Bad / Better Call Saul vibe
        />
      )}

      {activeTab === "New & Popular" && (
        <SectionHeader
          title="New & Popular"
          description="The latest and greatest hits everyone is talking about."
          image="https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg" // Last of Us
        />
      )}

      {activeTab === "My List" && (
        <SectionHeader
          title="My List"
          description="Your personal collection of must-watch movies and series."
          image="https://image.tmdb.org/t/p/original/xXHZeb1yhJvnSHPzZDqee0zfMb6.jpg" // Western/General stylistic background
        />
      )}

      {/* Content Layers */}
      <div className={`relative z-10 pb-20 space-y-8 px-4 md:px-0 bg-[#141414] pb-20`}>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading Streamix...</p>
          </div>
        ) : (
          <>
            {/* Movies Tab */}
            {activeTab === "Movies" && (
              <div className="px-8 md:px-12 pb-12">
                {/* 1. Trending Movies */}
                <MovieRow
                  title="Trending Movies"
                  movies={movies.filter(m => m.categories?.includes("Trending Movies")).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                  destinationUrl="/category/trending-movies"
                />

                {/* 2. Popular Movies */}
                <MovieRow
                  title="Popular Movies"
                  movies={movies.filter(m => m.categories?.includes("Popular Movies")).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                  destinationUrl="/category/popular-movies"
                />

                {/* 3. Top Rated Movies */}
                <MovieRow
                  title="Top Rated Movies"
                  movies={movies.filter(m => m.categories?.includes("Top Rated Movies")).sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                  destinationUrl="/category/top-rated-movies"
                />

                {/* 4. Dynamic Genre Rows */}
                {[
                  { id: 28, name: "Action" },
                  { id: 35, name: "Comedy" },
                  { id: 18, name: "Drama" },
                  { id: 878, name: "Science Fiction" },
                  { id: 27, name: "Horror" },
                  { id: 10749, name: "Romance" },
                  { id: 53, name: "Thriller" },
                  { id: 16, name: "Animation" }
                ].map(genre => {
                  const genreData = genres.find(g => g.id === genre.id) || genre;
                  const genreMovies = movies.filter(m =>
                    m.genreIds?.includes(genre.id) &&
                    !m.categories?.some(c => c.includes("TV")) &&
                    !m.category?.includes("TV")
                  );

                  if (genreMovies.length < 1) return null;

                  return (
                    <MovieRow
                      key={genre.id}
                      title={`${genreData.name} Movies`}
                      movies={genreMovies}
                      onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                      destinationUrl={`/category/genre-${genre.id}-movie?name=${encodeURIComponent(genreData.name)}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Series Tab */}
            {activeTab === "Series" && (
              <div className="px-8 md:px-12 pb-12">

                {/* 1. Trending Series */}
                <MovieRow
                  title="Trending Series"
                  movies={movies.filter(m => m.categories?.includes("Trending TV")).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
                  onMovieClick={(m) => navigate(`/movie/${m.id}?type=tv`)}
                  destinationUrl="/category/trending-tv"
                />

                {/* 2. Popular Series */}
                <MovieRow
                  title="Popular TV Shows"
                  movies={movies.filter(m => m.categories?.includes("Popular TV")).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
                  onMovieClick={(m) => navigate(`/movie/${m.id}?type=tv`)}
                  destinationUrl="/category/popular-tv"
                />

                {/* 3. Top Rated Series */}
                <MovieRow
                  title="Top Rated TV Shows"
                  movies={movies.filter(m => m.categories?.includes("Top Rated TV")).sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))}
                  onMovieClick={(m) => navigate(`/movie/${m.id}?type=tv`)}
                  destinationUrl="/category/top-rated-tv"
                />

                {/* 4. Dynamic Genre Rows for TV */}
                {[
                  { id: 10759, name: "Action & Adventure" },
                  { id: 35, name: "Comedy" },
                  { id: 18, name: "Drama" },
                  { id: 10765, name: "Sci-Fi & Fantasy" },
                  { id: 9648, name: "Mystery" },
                  { id: 80, name: "Crime" },
                  { id: 16, name: "Animation" }
                ].map(genre => {
                  const genreData = genres.find(g => g.id === genre.id) || genre;
                  const genreSeries = movies.filter(m =>
                    m.genreIds?.includes(genre.id) &&
                    (m.categories?.some(c => c.includes("TV")) || m.category?.includes("TV"))
                  );
                  if (genreSeries.length < 1) return null;
                  return (
                    <MovieRow
                      key={genre.id}
                      title={`${genreData.name} Series`}
                      movies={genreSeries}
                      onMovieClick={(m) => navigate(`/movie/${m.id}?type=tv`)}
                      destinationUrl={`/category/genre-${genre.id}-tv?name=${encodeURIComponent(genreData.name)}`}
                    />
                  );
                })}
              </div>
            )}

            {/* My List Grid View - 5 Columns */}
            {activeTab === "My List" && (
              <div className="px-8 md:px-12 pb-12">
                <h2 className="text-xl font-bold mb-4 text-white">Your List</h2>
                {getFilteredContent().length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {getFilteredContent().map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                        className="w-full aspect-[2/3]" // Responsive width, fixed aspect ratio
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Your watchlist is empty.</p>
                )}
              </div>
            )}


            {/* Show Home Categories - Fetch from specific endpoints */}
            {activeTab === "Home" && (
              <>
                {/* Trending Now - Mixed Movies + TV */}
                <MovieRow
                  title="Trending Now"
                  movies={movies.filter(m =>
                    m.categories?.includes("Trending Movies") ||
                    m.categories?.includes("Trending TV")
                  ).slice(0, 15)}
                  onMovieClick={(m) => navigate(`/movie/${m.id}${m.category?.includes('TV') || m.categories?.some(c => c.includes('TV')) || m.type === 'tv' ? '?type=tv' : ''}`)}
                  destinationUrl="/category/trending-all"
                />

                {/* Popular Movies */}
                <MovieRow
                  title="Popular Movies"
                  movies={movies.filter(m => m.categories?.includes("Popular Movies")).slice(0, 15)}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                  destinationUrl="/category/popular-movies"
                />

                {/* Top Rated Movies */}
                <MovieRow
                  title="Top Rated Movies"
                  movies={movies.filter(m => m.categories?.includes("Top Rated Movies")).slice(0, 15)}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                  destinationUrl="/category/top-rated-movies"
                />

                {/* Popular TV Shows */}
                <MovieRow
                  title="Popular TV Shows"
                  movies={movies.filter(m => m.categories?.includes("Popular TV")).slice(0, 15)}
                  onMovieClick={(m) => navigate(`/movie/${m.id}?type=tv`)}
                  destinationUrl="/category/popular-tv"
                />

                {/* Top Rated TV Shows */}
                <MovieRow
                  title="Top Rated TV Shows"
                  movies={movies.filter(m => m.categories?.includes("Top Rated TV")).slice(0, 15)}
                  onMovieClick={(m) => navigate(`/movie/${m.id}?type=tv`)}
                  destinationUrl="/category/top-rated-tv"
                />



                {/* Genre Section with Horizontal Tabs */}
                <GenreCarousel
                  movies={movies}
                  onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                />



              </>
            )}
          </>
        )}
      </div>
    </div >
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
