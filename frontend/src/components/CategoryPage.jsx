import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './dashboard/Navbar';
import MovieCard from './dashboard/MovieCard';
import movieService from '../services/movieService';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
    const { category } = useParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Home');

    useEffect(() => {
        const fetchMovies = async () => {
            if (category) {
                setLoading(true);
                try {
                    // Handle special "Trending" category if needed, or just standard categories
                    const results = await movieService.getMoviesByCategory(category);
                    setMovies(results);
                } catch (error) {
                    console.error("Failed to fetch movies for category", error);
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
                        {category} Movies
                    </h1>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                        {movies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onMovieClick={handleMovieClick} />
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
