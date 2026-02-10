import React from 'react';
import { Play, Info, Plus } from 'lucide-react';

const HeroSection = ({ featuredMovie }) => {
    // Default fallback if no movie is passed
    const defaultMovie = {
        title: "Interstellar",
        description: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        backdrop_path: "/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", // TMDB path
        vote_average: 8.4,
        release_date: "2014-11-05",
        original_language: "en"
    };

    const movie = featuredMovie || defaultMovie;

    // Handle different image path formats (absolute URL vs TMDB path)
    const getBackdrop = (m) => {
        if (m.backdropUrl) return m.backdropUrl;
        if (m.backdrop_path) return `https://image.tmdb.org/t/p/original${m.backdrop_path}`;
        if (m.posterUrl) return m.posterUrl; // Fallback to poster if no backdrop
        return `https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg`;
    };

    return (
        <div className="relative h-[85vh] w-full text-white">

            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={getBackdrop(movie)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                {/* Gradient Overlay (Fade to Bottom) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#141414] to-transparent"></div>
            </div>

            {/* Content Content using relative positioning to sit on top of background */}
            <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full md:w-1/2 space-y-6 mt-16">

                    {/* Movie Title Effect */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl">
                        {movie.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-sm md:text-base font-medium">
                        <span className="text-green-400">
                            {movie.vote_average ? `${Math.round(movie.vote_average * 10)}% Match` : "98% Match"}
                        </span>
                        <span className="text-gray-300">
                            {movie.release_date ? movie.release_date.substring(0, 4) : "2024"}
                        </span>
                        <span className="border border-gray-500 px-1 text-xs rounded text-gray-400">HD</span>
                        <span className="text-gray-300 uppercase">{movie.original_language || "EN"}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-lg line-clamp-3 drop-shadow-md">
                        {movie.description || movie.overview || "Experience the unknown in this thrilling adventure that pushes the boundaries of imagination."}
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center space-x-4 pt-4">
                        <button className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition font-bold text-lg">
                            <Play className="w-6 h-6 fill-black" />
                            <span>Play</span>
                        </button>

                        <button className="flex items-center space-x-2 bg-gray-500/70 hover:bg-gray-500/50 backdrop-blur-sm text-white px-8 py-3 rounded transition font-bold text-lg">
                            <Info className="w-6 h-6" />
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
