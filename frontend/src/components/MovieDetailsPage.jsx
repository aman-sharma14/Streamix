import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import movieService from '../services/movieService';
import interactionService from '../services/interactionService';
import authService from '../services/authService';
import MovieCard from './dashboard/MovieCard';
import { loadGenres, getGenreNames } from '../utils/genreUtils';

const MovieDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [genres, setGenres] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);

                // 1. Fetch Movie Details
                const movieData = await movieService.getMovieById(id);
                setMovie(movieData);

                // Load genres
                const genresData = await loadGenres();
                setGenres(genresData);

                // 2. Fetch Similar Movies using new endpoint
                if (movieData && movieData.tmdbId) {
                    try {
                        const similar = await movieService.getSimilarMovies(movieData.tmdbId);
                        setSimilarMovies(similar);
                    } catch (err) {
                        console.warn("Failed to fetch similar movies", err);
                    }
                }

                // 3. Check Watchlist status
                if (currentUser.id && movieData) {
                    try {
                        const watchlist = await interactionService.getWatchlist(currentUser.id);
                        const exists = watchlist.some(item => item.movieId === movieData.id);
                        setInWatchlist(exists);
                    } catch (e) {
                        console.warn("Failed to check watchlist status", e);
                    }
                }
            } catch (err) {
                console.error("Failed to load movie details", err);
                setError("Failed to load movie details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const [notification, setNotification] = useState(null);

    const handleWatchlistToggle = async () => {
        if (!user) return;

        try {
            if (inWatchlist) {
                await interactionService.removeFromWatchlist(user.id, movie.id);
                setInWatchlist(false);
                showNotification(`${movie.title} removed from Watchlist`);
            } else {
                await interactionService.addToWatchlist(user.id, movie.id, movie.title, movie.posterUrl);
                setInWatchlist(true);
                showNotification(`${movie.title} added to Watchlist`);
            }
        } catch (error) {
            console.error("Failed to update watchlist", error);
            showNotification("Failed to update watchlist. Please try again.");
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handlePlay = () => {
        alert("Playing movie: " + movie.title);
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
                <h2 className="text-2xl font-bold">Movie not found</h2>
                <p className="text-gray-400">{error || "The requested movie could not be loaded."}</p>
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
                        title={movie.title}
                        className="w-full h-full object-cover"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="relative w-full h-full">
                        <img
                            src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : movie.posterUrl}
                            alt={movie.title}
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
                                <span>Play Trailer</span>
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
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">{movie.title}</h1>

                            <div className="flex items-center space-x-4 text-sm md:text-base font-medium text-gray-300">
                                {movie.genreIds && genres && getGenreNames(movie.genreIds, genres) ? (
                                    <span className="text-green-500 font-bold">{getGenreNames(movie.genreIds, genres)}</span>
                                ) : (
                                    <span className="text-green-500 font-bold">98% Match</span>
                                )}
                                <span>{movie.releaseYear || movie.releaseDate?.split('-')[0] || "2024"}</span>
                                <span className="border border-gray-600 px-1.5 rounded text-xs">HD</span>
                            </div>
                        </div>

                        <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                            {movie.overview || "Experience the unknown in this thrilling adventure. (Description placeholder)"}
                        </p>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handlePlay}
                                className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition text-lg"
                            >
                                <Play className="w-6 h-6 fill-black" />
                                <span>Play</span>
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
                    </div>

                    {/* Right: Sidebar */}
                    <div className="bg-[#2f2f2f]/20 p-6 rounded-xl border border-white/5 h-fit space-y-6 backdrop-blur-sm">
                        <div>
                            <span className="block text-gray-500 mb-1 text-sm">Genres</span>
                            <span className="text-white font-medium">{movie.category}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1 text-sm">Maturity Rating</span>
                            <span className="border border-gray-500 px-1 text-xs text-white inline-block">TV-MA</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1 text-sm">Original Language</span>
                            <span className="text-white uppercase font-medium">{movie.original_language || "EN"}</span>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mt-20">
                    <h3 className="text-2xl font-bold mb-8 text-white">Recommendations</h3>
                    {similarMovies && similarMovies.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {similarMovies.map(m => (
                                <div key={m.id} className="transform hover:scale-105 transition duration-300 cursor-pointer" onClick={() => navigate(`/movie/${m.id}`)}>
                                    <MovieCard movie={m} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No similar movies found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;
