import React, { useState } from 'react';
import { X, Play, Plus, ArrowLeft, Check } from 'lucide-react';
import interactionService from '../../services/interactionService';
import MovieCard from './MovieCard'; // Re-use MovieCard for recommendations

const MovieDetailsModal = ({ movie, similarMovies, user, onClose, onMovieClick }) => {
    const [inWatchlist, setInWatchlist] = useState(false);

    if (!movie) return null;

    // Extract YouTube ID if possible
    console.log("Movie Video URL:", movie.videoUrl); // Debugging
    const isDirectVideo = movie.videoUrl && movie.videoUrl.includes("watch?v=");
    let embedUrl = "";
    if (isDirectVideo) {
        const videoId = movie.videoUrl.split("v=")[1]?.split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1`;
    }

    const handleAddToWatchlist = async () => {
        if (!user || inWatchlist) return;

        try {
            await interactionService.addToWatchlist(user.id, movie.id);
            setInWatchlist(true);
            console.log("Added to watchlist:", movie.title);
        } catch (error) {
            console.error("Failed to add to watchlist", error);
            alert("Failed to add to watchlist. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-[#181818] rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100 ring-1 ring-white/10 my-8 mx-4">

                {/* Top Actions: Close & Back */}
                <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-[#181818] rounded-full flex items-center justify-center hover:bg-[#333] transition ring-1 ring-white/20"
                        title="Close"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Back Button (Mobile friendly or as alternative) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-50 w-10 h-10 bg-[#181818] rounded-full flex items-center justify-center hover:bg-[#333] transition ring-1 ring-white/20"
                    title="Back"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>

                {/* Hero / Video Section */}
                <div className="relative aspect-video w-full bg-black">
                    {isDirectVideo ? (
                        <iframe
                            src={embedUrl}
                            title={movie.title}
                            className="w-full h-full object-cover"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="relative w-full h-full">
                            <img
                                src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <a
                                    href={movie.videoUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white text-black px-6 py-3 rounded font-bold flex items-center space-x-2 hover:scale-105 transition"
                                >
                                    <Play className="w-5 h-5 fill-black" />
                                    <span>Play Trailer</span>
                                </a>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#181818] to-transparent"></div>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">

                    {/* Left: Description & Meta */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-4xl font-extrabold text-white">{movie.title}</h2>
                        </div>

                        <div className="flex items-center space-x-3 text-sm font-semibold text-gray-400">
                            <span className="text-green-500">98% Match</span>
                            <span>{movie.release_date ? movie.release_date.split('-')[0] : "2024"}</span>
                            <span className="border border-gray-600 px-1 rounded text-gray-300">HD</span>
                        </div>

                        <p className="text-gray-300 leading-relaxed text-base">
                            {movie.overview || "Experience the unknown in this thrilling adventure. (Description placeholder)"}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center space-x-4 pt-4">
                            <button className="flex items-center space-x-2 bg-white text-black px-8 py-2.5 rounded font-bold hover:bg-gray-200 transition">
                                <Play className="w-6 h-6 fill-black" />
                                <span>Play</span>
                            </button>

                            <button
                                onClick={handleAddToWatchlist}
                                disabled={inWatchlist}
                                className={`flex items-center space-x-2 px-6 py-2.5 rounded font-bold transition border ${inWatchlist
                                    ? 'bg-transparent border-green-500 text-green-500 cursor-default'
                                    : 'bg-[#2a2a2a] border-transparent text-white hover:bg-[#3f3f3f] hover:border-white/30'
                                    }`}
                            >
                                {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                <span>{inWatchlist ? 'Added to List' : 'My List'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Sidebar Info */}
                    <div className="space-y-4 text-sm text-gray-400 bg-[#2f2f2f]/30 p-4 rounded-lg h-fit">
                        <div>
                            <span className="block text-gray-500 mb-1">Genres:</span>
                            <span className="text-white">{movie.category}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1">Maturity Rating:</span>
                            <span className="border border-gray-600 px-1 text-xs text-white">TV-MA</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1">Original Language:</span>
                            <span className="text-white uppercase">{movie.original_language || "EN"}</span>
                        </div>
                    </div>

                </div>

                {/* Recommendations Section */}
                <div className="p-8 border-t border-gray-800 bg-[#181818]">
                    <h3 className="text-xl font-bold mb-6 text-white">Recommendations</h3>
                    {similarMovies && similarMovies.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {similarMovies.map(m => (
                                <div key={m.id} className="scale-95 hover:scale-100 transition duration-300">
                                    <MovieCard movie={m} onOpenModal={onMovieClick} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No similar movies found.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MovieDetailsModal;
