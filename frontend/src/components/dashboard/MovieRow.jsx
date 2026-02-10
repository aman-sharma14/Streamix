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

    return (
        <div className="space-y-2 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-100 hover:text-white transition cursor-pointer">
                {title}
            </h2>

            {/* Row Container */}
            <div className="relative group/row">
                {/* Left Arrow */}
                <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 h-[300px] rounded-l-md"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Scrollable Area */}
                <div
                    ref={rowRef}
                    className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth py-8 px-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie) => (
                        <div key={movie.id} className="flex-none">
                            <MovieCard movie={movie} onOpenModal={onMovieClick} />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 h-[300px] rounded-r-md"
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
};

export default MovieRow;
