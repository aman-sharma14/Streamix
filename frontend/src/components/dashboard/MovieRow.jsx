import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieClick, destinationUrl, enableExplore = true }) => {
    const navigate = useNavigate();
    const rowRef = useRef(null);

    const handleScroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo =
                direction === 'left'
                    ? scrollLeft - clientWidth
                    : scrollLeft + clientWidth;

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const limit = 10;
    const displayMovies = movies.slice(0, limit);
    const showExploreMore = enableExplore && movies.length > limit;

    const handleExploreClick = () => {
        if (destinationUrl) {
            navigate(destinationUrl);
            return;
        }
        // Fallback
        const category = title.replace(" Movies", "").replace("Top ", "");
        navigate(`/category/${category}`);
    };

    return (
        <div className="space-y-0.5 mb-2 px-4 sm:px-8 lg:px-12 mx-auto">
            {/* Title Header - Clickable Group */}
            {title && (
                <div
                    className="flex items-center space-x-2 group/title cursor-pointer w-fit"
                    onClick={() => showExploreMore && handleExploreClick()}
                >
                    <h2 className="text-xl font-bold text-white group-hover/title:text-gray-300 group-hover/title:opacity-80 transition-all duration-300 flex items-center">
                        {title}
                        {showExploreMore && (
                            <ChevronRight className="w-6 h-5 ml-0.5 mt-1.5 text-white group-hover/title:text-gray-300 transition-colors duration-300" />
                        )}
                    </h2>
                </div>
            )}

            {/* Row Container */}
            <div className="relative group/row">
                {/* Left Arrow */}
                <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-40 bg-black/30 hover:bg-black/50 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 rounded-l-md"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Scrollable Area */}
                <div
                    ref={rowRef}
                    className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {displayMovies.map((movie) => (
                        <div key={movie.id} className="flex-none">
                            <MovieCard movie={movie} onMovieClick={onMovieClick} />
                        </div>
                    ))}

                    {/* Explore More Card */}
                    {showExploreMore && (
                        <div
                            onClick={handleExploreClick}
                            className="flex-none w-[120px] md:w-[180px] h-[180px] md:h-[270px] bg-gray-900 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition group"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <span className="text-red-600 font-bold text-xl">+</span>
                            </div>
                            <span className="text-gray-300 font-semibold group-hover:text-white">Explore More</span>
                        </div>
                    )}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-40 bg-black/30 hover:bg-black/50 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 rounded-r-md"
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
};

export default MovieRow;
