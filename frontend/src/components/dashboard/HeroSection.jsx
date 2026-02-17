import React, { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { loadGenres, getGenreNames } from '../../utils/genreUtils';

const HeroSection = ({ featuredMovie, onPlay, onMoreInfo }) => {
  const [genres, setGenres] = useState({});

  useEffect(() => {
    loadGenres().then(setGenres);
  }, []);
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
    <div className="relative w-full h-[80vh] text-white">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getBackdrop(movie)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent"></div>
      </div>

      {/* Content Content - Increased Top Padding for Navbar Clearance */}
      <div className="relative z-20 h-full flex items-center w-full px-4 sm:px-8 lg:px-12 pt-20">
        <div className="w-full md:w-2/3 lg:w-1/2 space-y-6 pb-12">

          {/* Movie Title Effect - Reduced sizes for better wrapping */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl leading-[1.1] max-w-4xl line-clamp-3">
            {movie.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm md:text-base font-medium">
            {movie.genreIds && genres && getGenreNames(movie.genreIds, genres) ? (
              <span className="text-green-400">
                {getGenreNames(movie.genreIds, genres)}
              </span>
            ) : (
              <span className="text-green-400">
                {movie.vote_average ? `${Math.round(movie.vote_average * 10)}% Match` : "98% Match"}
              </span>
            )}
            <span className="text-gray-300">
              {movie.releaseYear || movie.release_date?.substring(0, 4) || "2024"}
            </span>
            <span className="border border-gray-500 px-1 text-xs rounded text-gray-400">HD</span>
            <span className="text-gray-300 uppercase">{movie.original_language || "EN"}</span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base lg:text-lg line-clamp-3 drop-shadow-md max-w-xl">
            {movie.description || movie.overview || "Experience the unknown in this thrilling adventure that pushes the boundaries of imagination."}
          </p>

          {/* Buttons - Ensure Z-Index for Clickability */}
          <div className="flex items-center space-x-4 pt-4 relative z-30">
            <button
              onClick={onPlay}
              className="flex items-center space-x-3 bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 font-bold text-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transform hover:scale-105"
            >
              <Play className="w-6 h-6 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={onMoreInfo}
              className="flex items-center space-x-3 bg-gray-600/40 hover:bg-gray-600/60 backdrop-blur-md text-white px-8 py-3 rounded-lg transition-all duration-300 font-bold text-lg border border-white/10 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
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
