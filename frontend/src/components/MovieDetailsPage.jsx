import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import movieService from '../services/movieService';
import interactionService from '../services/interactionService';
import authService from '../services/authService';
import MovieCard from './dashboard/MovieCard';

const MovieDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [genresMap, setGenresMap] = useState({});

    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState(null);

    // Helpers
    const getMatchPercentage = (voteAverage) => {
        if (!voteAverage) return "95% Match";
        return `${Math.round(voteAverage * 10)}% Match`;
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    // 1. Fetch Genres Map (once)
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const genresList = await movieService.getGenres();
                const map = {};
                genresList.forEach(g => map[g.tmdbId] = g.name);
                setGenresMap(map);
            } catch (error) {
                console.warn("Failed to fetch genres map", error);
            }
        };
        fetchGenres();
    }, []);

    // 2. Fetch Details, Cast, Similar
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setMovie(null);
            setCast([]);
            setSimilarMovies([]);

            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);

                // Determine type (movie vs tv)
                const searchParams = new URLSearchParams(window.location.search);
                const typeParam = searchParams.get('type');
                const isTV = typeParam === 'tv';

                // A. Fetch Main Details
                let movieData;
                if (isTV) {
                    movieData = await movieService.getTVShowById(id);
                } else {
                    movieData = await movieService.getMovieById(id);
                }

                // Unify fields if necessary (Handle both camelCase and snake_case)
                // Backend entities usually return camelCase. DTOs might return snake_case.
                // We'll trust the data but have fallbacks in render.
                setMovie(movieData);

                // B. Fetch Cast & Similar
                if (movieData && movieData.tmdbId) {
                    const tmdbId = movieData.tmdbId;

                    // Cast
                    try {
                        const castData = isTV
                            ? await movieService.getTVShowCast(tmdbId)
                            : await movieService.getMovieCast(tmdbId);
                        setCast(castData || []);
                    } catch (e) { console.warn("Cast fetch failed", e); }

                    // Similar
                    try {
                        let similarData = isTV
                            ? await movieService.getSimilarTVShows(tmdbId)
                            : await movieService.getSimilarMovies(tmdbId);

                        // Fallback logic if specialized endpoint returns nothing
                        if (!similarData || similarData.length === 0) {
                            const allData = isTV ? await movieService.getAllTVShows() : await movieService.getAllMovies();
                            similarData = allData
                                .filter(m => m.category === movieData.category && m.id !== movieData.id)
                                .slice(0, 10);
                        }
                        setSimilarMovies(similarData || []);
                    } catch (e) { console.warn("Similar fetch failed", e); }
                }

                // C. Check Watchlist
                if (currentUser.id && movieData) {
                    try {
                        const watchlist = await interactionService.getWatchlist(currentUser.id);
                        const exists = watchlist.some(item => item.movieId === movieData.id);
                        setInWatchlist(exists);
                    } catch (e) { console.warn("Watchlist check failed", e); }
                }

            } catch (err) {
                console.error("Failed to load details", err);
                setError("Failed to load content details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleWatchlistToggle = async () => {
        if (!user) return;
        if (!movie) return;

        try {
            if (inWatchlist) {
                await interactionService.removeFromWatchlist(user.id, movie.id);
                setInWatchlist(false);
                showNotification(`${movie.title || movie.name} removed from Watchlist`);
            } else {
                await interactionService.addToWatchlist(user.id, movie.id);
                setInWatchlist(true);
                showNotification(`${movie.title || movie.name} added to Watchlist`);
            }
        } catch (error) {
            console.error("Failed to update watchlist", error);
            showNotification("Failed to update watchlist. Please try again.");
        }
    };

    const handlePlay = () => {
        alert("Playing: " + (movie?.title || movie?.name));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#141414] flex items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-bold">Content not found</h2>
                <p className="text-gray-400">{error || "The requested content could not be loaded."}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // Video Logic
    const isDirectVideo = movie.videoUrl && movie.videoUrl.includes("watch?v=");
    let embedUrl = "";
    if (isDirectVideo) {
        const videoId = movie.videoUrl.split("v=")[1]?.split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1`;
    }

    const title = movie.title || movie.name;
    const releaseYear = (movie.releaseDate || movie.firstAirDate || movie.releaseYear || "2024").toString().substring(0, 4);
    const voteAverage = movie.voteAverage || movie.vote_average || 0;
    const backdrop = movie.backdropUrl || movie.backdrop_path || movie.posterUrl;

    // Genre Mapping
    const genreNames = movie.genreIds?.map(id => genresMap[id]).filter(Boolean).join(', ');
    const displayGenre = genreNames || movie.category || "General";

    return (
        <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden animate-in fade-in duration-300">

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-in slide-in-from-right duration-300 flex items-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>{notification}</span>
                </div>
            )}

            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="fixed top-6 left-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#333] transition ring-1 ring-white/20 group"
                title="Back to Dashboard"
            >
                <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Hero / Video Section */}
            <div className="relative w-full h-[60vh] md:h-[70vh] bg-black">
                {isDirectVideo ? (
                    <iframe
                        src={embedUrl}
                        title={title}
                        className="w-full h-full object-cover"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="relative w-full h-full">
                        <img
                            src={backdrop}
                            alt={title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <a
                                href={movie.videoUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-black px-8 py-4 rounded font-bold flex items-center space-x-3 hover:scale-105 transition shadow-lg"
                            >
                                <Play className="w-6 h-6 fill-black" />
                                <span className="text-black">Play Trailer</span>
                            </a>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#141414] to-transparent"></div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">

                    {/* Left: Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">{title}</h1>

                            <div className="flex items-center space-x-4 text-sm md:text-base font-medium text-gray-300">
                                <span>{releaseYear}</span>
                                <span className="border border-gray-600 px-1.5 rounded text-xs">HD</span>
                                {movie.type === 'tv' && (
                                    <span className="border border-gray-600 px-1.5 rounded text-xs">TV Series</span>
                                )}
                            </div>
                        </div>

                        <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                            {movie.overview || "Experience the unknown in this thrilling adventure."}
                        </p>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handlePlay}
                                className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition text-lg"
                            >
                                <Play className="w-6 h-6 fill-black text-black" />
                                <span className="text-black">Play</span>
                            </button>

                            <button
                                onClick={handleWatchlistToggle}
                                className={`flex items-center space-x-2 px-8 py-3 rounded font-bold transition border text-lg ${inWatchlist
                                    ? 'bg-transparent border-green-500 text-green-500 hover:bg-green-500/10'
                                    : 'bg-[#2a2a2a] border-transparent text-white hover:bg-[#3f3f3f] hover:border-white/30'
                                    }`}
                            >
                                {inWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                <span>{inWatchlist ? 'Added to List' : 'My List'}</span>
                            </button>
                        </div>

                        {/* Cast Section */}
                        {cast && cast.length > 0 && (
                            <div className="pt-6">
                                <h3 className="text-xl font-bold mb-4 text-white">Cast</h3>
                                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {cast.map((actor, idx) => (
                                        <div key={actor.id || idx} className="flex-shrink-0 w-24 text-center">
                                            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gray-800 border border-gray-700">
                                                {actor.profile_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                        alt={actor.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-wrap px-1">No Image</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-300 font-medium truncate w-full">{actor.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate w-full">{actor.character}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar */}
                    <div className="bg-[#2f2f2f]/20 p-6 rounded-xl border border-white/5 h-fit space-y-6 backdrop-blur-sm">
                        <div>
                            <span className="block text-gray-500 mb-1 text-sm">Genres</span>
                            <span className="text-white font-medium">{displayGenre}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1 text-sm">Maturity Rating</span>
                            <span className="border border-gray-500 px-1 text-xs text-white inline-block">TV-MA</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1 text-sm">Original Language</span>
                            <span className="text-white uppercase font-medium">{movie.originalLanguage || "EN"}</span>
                        </div>

                        {/* Series Specifics */}
                        {(movie.numberOfSeasons || movie.number_of_seasons) && (
                            <div className="pt-2 border-t border-gray-700">
                                <span className="block text-gray-500 mb-1 text-sm">Seasons</span>
                                <span className="text-white font-medium block">{movie.numberOfSeasons || movie.number_of_seasons} Seasons</span>
                                <span className="text-gray-400 text-xs block">{movie.numberOfEpisodes || movie.number_of_episodes} Episodes</span>
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-700">
                            <span className="block text-gray-500 mb-1 text-sm">Popularity</span>
                            <span className="text-white font-medium">{Math.round(movie.popularity || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mt-20">
                    <h3 className="text-2xl font-bold mb-8 text-white">More Like This</h3>
                    {similarMovies && similarMovies.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {similarMovies.map(m => (
                                <div
                                    key={m.id}
                                    className="transform hover:scale-105 transition duration-300 cursor-pointer"
                                    onClick={() => {
                                        // Navigate with type param if target is TV or we are currently on TV page and target has no type
                                        const typeSuffix = (movie.type === 'tv' || m.type === 'tv') ? '?type=tv' : '';
                                        navigate(`/movie/${m.id}${typeSuffix}`);
                                        window.scrollTo(0, 0); // Ensure scroll to top
                                    }}
                                >
                                    <MovieCard movie={m} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No recommendations available at this time.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;
