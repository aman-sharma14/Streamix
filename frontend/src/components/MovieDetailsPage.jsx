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
    const [history, setHistory] = useState(null);
    const [tvDetails, setTvDetails] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
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
            setHistory(null);
            setTvDetails(null);

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
                    // Fetch full TV details from proxy for seasons/episodes
                    if (movieData && movieData.tmdbId) {
                        try {
                            const details = await movieService.getTVShowDetailsFromProxy(movieData.tmdbId);
                            setTvDetails(details);
                        } catch (e) { console.warn("Proxy details fetch failed", e); }
                    }
                } else {
                    movieData = await movieService.getMovieById(id);
                }

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

                        if (!similarData || similarData.length === 0) {
                            const allData = isTV ? await movieService.getAllTVShows() : await movieService.getAllMovies();
                            similarData = allData
                                .filter(m => m.category === movieData.category && m.id !== movieData.id)
                                .slice(0, 10);
                        }
                        setSimilarMovies(similarData || []);
                    } catch (e) { console.warn("Similar fetch failed", e); }
                }

                // C. Fetch Watchlist & History
                if (currentUser.id && movieData) {
                    try {
                        const [watchlist, userHistory] = await Promise.all([
                            interactionService.getWatchlist(currentUser.id),
                            interactionService.getHistory(currentUser.id)
                        ]);

                        const exists = watchlist.some(item => item.movieId === movieData.id);
                        setInWatchlist(exists);

                        // Find most relevant history entry
                        const itemHistory = userHistory
                            .filter(h => h.movieId === movieData.id)
                            .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt))[0];
                        setHistory(itemHistory);

                        if (itemHistory && itemHistory.season) {
                            setSelectedSeason(itemHistory.season);
                        }
                    } catch (e) { console.warn("Interaction data fetch failed", e); }
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
                await interactionService.addToWatchlist(user.id, movie.id, movie.title || movie.name, movie.posterUrl);
                setInWatchlist(true);
                showNotification(`${movie.title || movie.name} added to Watchlist`);
            }
        } catch (error) {
            console.error("Failed to update watchlist", error);
            showNotification("Failed to update watchlist. Please try again.");
        }
    };

    const handlePlay = (resume = true, s = null, e = null) => {
        if (!movie) return;
        let url = `/watch/${movie.id}?type=${movie.type || 'movie'}`;

        if (movie.type === 'tv') {
            const seasonNum = s || selectedSeason || 1;
            const episodeNum = e || 1;
            url += `&season=${seasonNum}&episode=${episodeNum}`;
        }

        if (resume && history && history.startAt > 0 && !history.completed) {
            url += `&startAt=${Math.floor(history.startAt)}`;
        }

        navigate(url);
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

    const title = movie.title || movie.name;
    const releaseYear = (movie.releaseDate || movie.firstAirDate || movie.releaseYear || "2024").toString().substring(0, 4);
    const backdrop = movie.backdropUrl || movie.backdrop_path || movie.posterUrl;

    // Genre Mapping
    const genreNames = movie.genreIds?.map(id => genresMap[id]).filter(Boolean).join(', ');
    const displayGenre = genreNames || movie.category || "General";

    const hasProgress = history && history.startAt > 0 && !history.completed;

    return (
        <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden animate-in fade-in duration-300 font-sans">

            {notification && (
                <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-in slide-in-from-right duration-300 flex items-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>{notification}</span>
                </div>
            )}

            <button
                onClick={() => navigate('/dashboard')}
                className="fixed top-6 left-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#333] transition ring-1 ring-white/20 group"
                title="Back to Dashboard"
            >
                <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="relative w-full h-[70vh] bg-black">
                <img
                    src={backdrop}
                    alt={title}
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 space-y-6 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-2xl">{title}</h1>

                    <div className="flex items-center space-x-4 text-lg font-medium text-gray-200">
                        <span className="text-green-500 font-bold">{getMatchPercentage(movie.voteAverage)}</span>
                        <span>{releaseYear}</span>
                        <span className="border border-gray-500 px-2 py-0.5 rounded text-xs">HD</span>
                        {movie.type === 'tv' && (
                            <span className="border border-gray-500 px-2 py-0.5 rounded text-xs uppercase tracking-wider">TV Series</span>
                        )}
                    </div>

                    <p className="text-xl text-gray-300 leading-relaxed max-w-2xl drop-shadow-md">
                        {movie.overview || "Experience the unknown in this thrilling adventure."}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        {movie.type !== 'tv' ? (
                            <>
                                <button
                                    onClick={() => handlePlay(true)}
                                    className="flex items-center space-x-3 bg-white text-black px-10 py-4 rounded font-extrabold hover:bg-gray-200 transition text-xl shadow-xl hover:scale-105"
                                >
                                    <Play className="w-7 h-7 fill-black" />
                                    <span>{hasProgress ? 'Resume' : 'Play'}</span>
                                </button>
                                {hasProgress && (
                                    <button
                                        onClick={() => handlePlay(false)}
                                        className="flex items-center space-x-3 bg-[#333]/80 backdrop-blur-md text-white px-10 py-4 rounded font-extrabold hover:bg-[#444] transition text-xl shadow-xl hover:scale-105"
                                    >
                                        <span>Restart</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => handlePlay(true)}
                                className="flex items-center space-x-3 bg-white text-black px-10 py-4 rounded font-extrabold hover:bg-gray-200 transition text-xl shadow-xl hover:scale-105"
                            >
                                <Play className="w-7 h-7 fill-black" />
                                <span>{hasProgress ? `Resume S${history.season}E${history.episode}` : 'Watch Series'}</span>
                            </button>
                        )}

                        <button
                            onClick={handleWatchlistToggle}
                            className={`flex items-center space-x-3 px-10 py-4 rounded font-extrabold transition border-2 text-xl shadow-xl hover:scale-105 ${inWatchlist
                                ? 'bg-transparent border-green-500 text-green-500 hover:bg-green-500/10'
                                : 'bg-[#2a2a2a]/60 backdrop-blur-md border-transparent text-white hover:bg-[#3f3f3f] hover:border-white/30'
                                }`}
                        >
                            {inWatchlist ? <Check className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                            <span>{inWatchlist ? 'In My List' : 'My List'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-16">

                {/* TV Season/Episode Selector */}
                {movie.type === 'tv' && tvDetails && (
                    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h2 className="text-3xl font-bold">Episodes</h2>
                            <select
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                                className="bg-[#2a2a2a] text-white px-6 py-2 rounded-md font-bold text-lg border border-white/20 focus:outline-none focus:ring-2 ring-red-600 cursor-pointer"
                            >
                                {tvDetails.seasons?.filter(s => s.season_number > 0).map(s => (
                                    <option key={s.id} value={s.season_number}>
                                        Season {s.season_number} ({s.episode_count} Episodes)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: tvDetails.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 0 }).map((_, i) => {
                                const epNum = i + 1;
                                const isCurrentHistory = history && history.season === selectedSeason && history.episode === epNum;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handlePlay(false, selectedSeason, epNum)}
                                        className="group relative bg-[#1f1f1f] rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition cursor-pointer"
                                    >
                                        <div className="aspect-video bg-gray-900 relative">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                <Play className="w-12 h-12 text-white fill-white" />
                                            </div>
                                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">
                                                EP {epNum}
                                            </div>
                                            {isCurrentHistory && (
                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                                                    <div
                                                        className="h-full bg-red-600"
                                                        style={{ width: `${(history.startAt / history.duration) * 100}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-red-500 transition">Episode {epNum}</h4>
                                            <p className="text-sm text-gray-400 line-clamp-2">Season {selectedSeason}, Episode {epNum} of {title}.</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cast */}
                {cast && cast.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">Top Cast</h3>
                        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                            {cast.map((actor, idx) => (
                                <div key={actor.id || idx} className="flex-shrink-0 w-32 text-center group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-red-600 transition duration-300 shadow-xl">
                                        {actor.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                alt={actor.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-gray-500">No Image</div>
                                        )}
                                    </div>
                                    <p className="text-sm text-white font-bold truncate">{actor.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                <div className="space-y-8 pt-8">
                    <h3 className="text-3xl font-bold text-white">More Like This</h3>
                    {similarMovies && similarMovies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {similarMovies.map(m => (
                                <div
                                    key={m.id}
                                    className="group transform hover:scale-105 transition duration-300 cursor-pointer"
                                    onClick={() => {
                                        const typeSuffix = (movie.type === 'tv' || m.type === 'tv') ? '?type=tv' : '';
                                        navigate(`/movie/${m.id}${typeSuffix}`);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <MovieCard movie={m} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">Finding more great content for you...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;
