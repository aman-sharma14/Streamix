import React, { useState, useEffect } from 'react';
import { loadGenres, getGenreNames } from '../../utils/genreUtils';

const GenreFilter = ({ onGenreSelect, selectedGenre }) => {
    const [genres, setGenres] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchGenres = async () => {
            const genresMap = await loadGenres();
            // Convert map to array of {id, name}
            const genresArray = Object.entries(genresMap).map(([id, name]) => ({
                id: parseInt(id),
                name
            }));
            setGenres(genresArray);
        };
        fetchGenres();
    }, []);

    const handleSelect = (genreId, genreName) => {
        onGenreSelect(genreId, genreName);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-between items-center w-64 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
                <span className="font-medium">
                    {selectedGenre ? selectedGenre : 'All Genres'}
                </span>
                <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    <div className="py-1">
                        <button
                            onClick={() => handleSelect(null, null)}
                            className={`block w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${!selectedGenre ? 'bg-gray-700 text-red-500' : 'text-white'
                                }`}
                        >
                            All Genres
                        </button>
                        {genres.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => handleSelect(genre.id, genre.name)}
                                className={`block w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${selectedGenre === genre.name ? 'bg-gray-700 text-red-500' : 'text-white'
                                    }`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenreFilter;
