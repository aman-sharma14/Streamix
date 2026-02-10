import React from 'react';
import { X, Play, Plus, ThumbsUp } from 'lucide-react';

const MovieDetailsModal = ({ movie, onClose }) => {
    if (!movie) return null;

    // Extract YouTube ID if possible (Assuming videoUrl is standard YT link)
    // Standard format: https://www.youtube.com/watch?v=VIDEO_ID
    // Or: https://www.youtube.com/results?search_query=... (In our case, it might be a search link if it was from the specific scraper logic)

    // For better UX, we'll try to embed if it's a direct watch link, else show a thumbnail.
    const isDirectVideo = movie.videoUrl && movie.videoUrl.includes("watch?v=");
    let embedUrl = "";
    if (isDirectVideo) {
        const videoId = movie.videoUrl.split("v=")[1]?.split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1`;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-[#181818] rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100 ring-1 ring-white/10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-[#181818] rounded-full flex items-center justify-center hover:bg-[#333] transition"
                >
                    <X className="w-6 h-6 text-white" />
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
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <a
                                    href={movie.videoUrl}
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
                            <h2 className="text-3xl font-bold text-white">{movie.title}</h2>
                        </div>

                        <div className="flex items-center space-x-3 text-sm font-semibold text-gray-400">
                            <span className="text-green-500">98% Match</span>
                            <span>2024</span>
                            <span className="border border-gray-600 px-1 rounded text-gray-300">HD</span>
                        </div>

                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                            {/* Placeholder description if none exists in DB */}
                            Thinking about what to verify next? This is a placeholder description because the Movie entity currently doesn't have a 'description' field.
                            However, this movie belongs to the <strong>{movie.category}</strong> genre.
                        </p>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">
                                <Play className="w-5 h-5 fill-black" />
                                <span>Play</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-[#2a2a2a] text-white px-6 py-2 rounded font-bold hover:bg-[#3f3f3f] transition">
                                <Plus className="w-5 h-5" />
                                <span>My List</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-[#2a2a2a] text-white px-6 py-2 rounded font-bold hover:bg-[#3f3f3f] transition">
                                <ThumbsUp className="w-5 h-5" />
                                <span>Rate</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Sidebar Info */}
                    <div className="space-y-4 text-sm text-gray-400">
                        <div>
                            <span className="block text-gray-500 mb-1">Genres:</span>
                            <span className="text-white hover:underline cursor-pointer">{movie.category}</span>, Exciting, Action
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1">Maturity Rating:</span>
                            <span className="border border-gray-600 px-1 text-xs">TV-14</span>
                        </div>
                    </div>

                </div>

                {/* Similar Movies (Mock for now, could be same category) */}
                <div className="p-8 border-t border-gray-800">
                    <h3 className="text-xl font-bold mb-4">More Like This</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#2f2f2f] h-32 rounded flex items-center justify-center text-gray-500">
                                Recommendation {i}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MovieDetailsModal;
