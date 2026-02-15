import React, { useState, useEffect } from 'react';
import { loadGenres } from '../../utils/genreUtils';
import MovieRow from './MovieRow';

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

    // Inject the selected genre name into the movie object so MovieCard displays it
    // instead of the default category (e.g., "Trending Movies")
    const moviesWithGenre = filteredMovies.map(m => ({
        ...m,
        category: selectedGenreName // Override/Set category to the specific genre name
    }));

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

            {/* Movie Carousel using MovieRow */}
            {moviesWithGenre.length > 0 ? (
                <div className="-mx-4 sm:-mx-6 lg:-mx-8"> {/* Negative margin to counteract MovieRow's padding since we are already inside a container */}
                    <MovieRow
                        title=""
                        movies={moviesWithGenre}
                        onMovieClick={onMovieClick}
                        destinationUrl={`/category/genre-${selectedGenreId}-all?name=${encodeURIComponent(selectedGenreName)}`}
                    />
                </div>
            ) : (
                <div className="w-full py-10 text-center text-gray-400">
                    No {selectedGenreName} content available
                </div>
            )}
        </div>
    );
};

export default GenreCarousel;
