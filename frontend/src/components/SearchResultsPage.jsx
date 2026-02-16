import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './dashboard/Navbar'; // Reusing Navbar
import MovieCard from './dashboard/MovieCard';
import movieService from '../services/movieService';
import { ArrowLeft } from 'lucide-react';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Reusing the same active tab logic for Navbar context if needed
    // or just pass a dummy function since we are not on dashboard
    const [activeTab, setActiveTab] = useState('Home');

    useEffect(() => {
        const fetchResults = async () => {
            if (query) {
                setLoading(true);
                try {
                    // Search both movies and TV shows
                    const [movieResults, tvResults] = await Promise.all([
                        movieService.searchMovies(query).catch(() => []),
                        movieService.searchTVShows(query).catch(() => [])
                    ]);

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

                    setMovies(unique);
                } catch (error) {
                    console.error("Failed to fetch search results", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchResults();
    }, [query]);

    const handleMovieClick = (movie) => {
        navigate(`/movie/${movie.id}${movie.type === 'tv' ? '?type=tv' : ''}`);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-3xl font-bold">
                        Search Results for <span className="text-red-500">"{query}"</span>
                    </h1>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onMovieClick={handleMovieClick} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400">No results found for "{query}".</p>
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

export default SearchResultsPage;
