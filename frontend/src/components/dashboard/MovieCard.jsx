import React from 'react';

const MovieCard = ({ movie, onMovieClick, className }) => {

    // Generic image getter
    const getPoster = (m) => {
        if (m.posterUrl) return m.posterUrl;
        if (m.poster_path) return `https://image.tmdb.org/t/p/w500${m.poster_path}`;
        return "https://via.placeholder.com/300x450?text=No+Image";
    };

    const imageSrc = getPoster(movie);

    return (
        <div
            onClick={() => onMovieClick && onMovieClick(movie)}
            className={`relative flex-none group overflow-hidden rounded-md bg-[#181818] cursor-pointer ${className || "w-[220px] h-[330px]"}`}
        >

            {/* Poster Image */}
            <img
                src={imageSrc}
                alt={movie.title}
                className="
                    w-full h-full object-cover
                    transition-all duration-500 ease-out
                    group-hover:scale-105
                    group-hover:opacity-80
                "
            />

            {/* Gradient Overlay */}
            <div
                className="
                    absolute inset-0
                    bg-gradient-to-t from-black/80 via-black/30 to-transparent
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity duration-500
                "
            />

            {/* Bottom Info */}
            <div
                className="
                    absolute bottom-0 left-0 right-0
                    px-4 pb-4
                    transform translate-y-6
                    opacity-0
                    group-hover:translate-y-0
                    group-hover:opacity-100
                    transition-all duration-500 ease-out
                "
            >
                <h3 className="text-white font-semibold text-base leading-tight truncate">
                    {movie.title}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                    {movie.category || "Movie"}
                </p>
            </div>

        </div>
    );
};

export default MovieCard;
