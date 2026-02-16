import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './dashboard/Navbar';
import MovieCard from './dashboard/MovieCard';
import movieService from '../services/movieService';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
    const { category } = useParams();
    const location = useLocation();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Home');

    // Parse query params for name
    const searchParams = new URLSearchParams(location.search);
    const categoryName = searchParams.get('name');

    // Get display title
    const getTitle = () => {
        if (categoryName) {
            if (category.endsWith('-all')) return categoryName; // Just "Action"
            return categoryName + (category.includes('-tv') ? ' Series' : ' Movies');
        }
        if (category === 'trending-movies') return 'Trending Movies';
        if (category === 'popular-movies') return 'Popular Movies';
        if (category === 'top-rated-movies') return 'Top Rated Movies';
        if (category === 'trending-tv') return 'Trending Series';
        if (category === 'popular-tv') return 'Popular Series';
        if (category === 'top-rated-tv') return 'Top Rated Series';
        if (category === 'trending-all') return 'Trending Now';
        return category.replace(/-/g, ' ');
    };

    useEffect(() => {
        const fetchMovies = async () => {
            if (category) {
                setLoading(true);
                try {
                    let results = [];
                    // Handle specific categories
                    if (category === 'trending-movies') {
                        results = await movieService.getTrendingMovies();
                    } else if (category === 'popular-movies') {
                        results = await movieService.getPopularMovies();
                    } else if (category === 'top-rated-movies') {
                        results = await movieService.getTopRatedMovies();
                    } else if (category === 'trending-tv') {
                        results = await movieService.getTrendingTVShows();
                    } else if (category === 'popular-tv') {
                        results = await movieService.getPopularTVShows();
                    } else if (category === 'top-rated-tv') {
                        results = await movieService.getTopRatedTVShows();

                        // NEW: Combined Types
                    } else if (category === 'trending-all') {
                        const [movies, tv] = await Promise.all([
                            movieService.getTrendingMovies(),
                            movieService.getTrendingTVShows()
                        ]);
                        results = [...movies, ...tv];
                        // Sort by popularity if available? Or just interleave?
                        // For now, simpler is fine.
                    } else if (category.startsWith('genre-')) {
                        // Format: genre-<id>-movie or genre-<id>-tv or genre-<id>-all
                        const parts = category.split('-');
                        const genreId = parseInt(parts[1]);
                        const type = parts[2]; // 'movie' or 'tv' or 'all'

                        if (type === 'movie') {
                            const allMovies = await movieService.getAllMovies();
                            results = allMovies.filter(m => m.genreIds?.includes(genreId) && !m.categories?.some(c => c.includes("TV")));
                        } else if (type === 'tv') {
                            const allTV = await movieService.getAllTVShows();
                            results = allTV.filter(m => m.genreIds?.includes(genreId) || m.categories?.some(c => c.includes("TV")));
                        } else if (type === 'all') {
                            const [allMovies, allTV] = await Promise.all([
                                movieService.getAllMovies(),
                                movieService.getAllTVShows()
                            ]);
                            results = [
                                ...allMovies.filter(m => m.genreIds?.includes(genreId)),
                                ...allTV.filter(m => m.genreIds?.includes(genreId))
                            ];
                        }
                    } else {
                        // Fallback to generic backend category
                        results = await movieService.getMoviesByCategory(category);
                    }
                    setMovies(results);
                } catch (error) {
                    console.error("Failed to fetch movies for category", error);
                    setMovies([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMovies();
    }, [category]);

    const handleMovieClick = (movie) => {
        navigate(`/movie/${movie.id}`);
    };

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-3xl font-bold">
                        {getTitle()}
                    </h1>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {movies.map(movie => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onMovieClick={() => {
                                    const isTV = category.includes('tv') || movie.type === 'tv' || movie.category?.includes('TV') || (typeof movie.title === 'string' && movie.title.includes('Series'));
                                    navigate(`/movie/${movie.id}${isTV ? '?type=tv' : ''}`);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400">No movies found in "{category}".</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
