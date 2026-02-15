import React, { useState, useEffect } from 'react';
import { loadGenres } from '../../utils/genreUtils';

const GenreCarousel = ({ movies, onMovieClick }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenreId, setSelectedGenreId] = useState(28); // Default: Action (ID 28)
    const [selectedGenreName, setSelectedGenreName] = useState('Action');

    useEffect(() => {
        const fetchGenres = async () => {
            const genresMap = await loadGenres();
            // Convert to array and get popular genres
            const popularGenreIds = [28, 35, 18, 878, 27, 10749, 9648, 10751]; // Action, Comedy, Drama, Sci-Fi, Horror, Romance, Mystery, Family
            const genresArray = popularGenreIds
                .map(id => ({ id, name: genresMap[id] }))
                .filter(g => g.name);

            setGenres(genresArray);
        };
        fetchGenres();
    }, []);

    const filteredMovies = movies.filter(m => m.genreIds?.includes(selectedGenreId));

    return (
        <div className="space-y-4 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Genre Header with Tabs - Flex column on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-100">Genres</h2>

                {/* Horizontal Genre Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 w-full md:w-auto">
                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => {
                                setSelectedGenreId(genre.id);
                                setSelectedGenreName(genre.name);
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${selectedGenreId === genre.id
                                ? 'bg-red-600 text-white font-semibold'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                }`}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Movie Carousel */}
            <div className="relative group/row">
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-4">
                    {filteredMovies.length > 0 ? (
                        filteredMovies.slice(0, 20).map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => onMovieClick(movie)}
                                className="flex-none w-[150px] md:w-[200px] cursor-pointer transform transition-transform hover:scale-105"
                            >
                                <img
                                    src={movie.posterUrl || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title || movie.name}
                                    className="w-full h-[225px] md:h-[300px] object-cover rounded-md shadow-lg"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
                                    }}
                                />
                                {/* Optional: Title overlay or below, keeping clean like MovieRow */}
                            </div>
                        ))
                    ) : (
                        <div className="w-full py-10 text-center text-gray-400">
                            No {selectedGenreName} content available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenreCarousel;
