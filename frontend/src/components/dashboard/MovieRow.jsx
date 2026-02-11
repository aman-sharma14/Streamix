import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieClick }) => {
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
    const showExploreMore = movies.length > limit;

    const handleExploreClick = () => {
        // Navigate to category page
        // Assuming title is like "Action Movies" -> "Action"
        // Or pass category slug as prop. For now, try to parse title or ignore if specialized row.
        const category = title.replace(" Movies", "").replace("Top ", "");
        window.location.href = `/category/${category}`;
        // Using window.location for now to ensure full reload/reset, strictly cleaner would be useNavigate
    };

    return (
        <div className="space-y-2 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-100 hover:text-white transition cursor-pointer">
                    {title}
                </h2>
                {showExploreMore && (
                    <a href={`/category/${title.replace(" Movies", "")}`} className="text-sm text-gray-400 hover:text-white transition font-semibold">
                        Explore All &gt;
                    </a>
                )}
            </div>

            {/* Row Container */}
            <div className="relative group/row">
                {/* Left Arrow */}
                <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-8 bottom-8 z-40 bg-black/30 hover:bg-black/50 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 rounded-l-md"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Scrollable Area */}
                <div
                    ref={rowRef}
                    className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth py-8 px-4"
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
                            className="flex-none w-[150px] md:w-[200px] h-[225px] md:h-[300px] bg-gray-900 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition group"
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
                    className="absolute right-0 top-8 bottom-8 z-40 bg-black/30 hover:bg-black/50 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 rounded-r-md"
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
};

export default MovieRow;
