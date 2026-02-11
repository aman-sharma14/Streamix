import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const MoviesHeader = ({ activeCategory, onCategoryChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const genreDetails = {
        "All": {
            image: "https://assets.nflxext.com/ffe/siteui/vlv3/dace47b4-a5cb-4368-80fe-c26f3e77d540/f5b52435-458f-498f-9d1d-ccd4f1af9913/IN-en-20231023-popsignuptwoweeks-perspective_alpha_website_large.jpg",
            quote: "Movies move us like nothing else can, whether they’re scary, funny, dramatic, romantic or anywhere in-between."
        },
        "Action": {
            image: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", // Avengers End Game
            quote: "Adrenaline, explosions, and heroes saving the world."
        },
        "Science Fiction": {
            image: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", // Interstellar
            quote: "Explore the unknown, from deep space to future worlds."
        },
        "Comedy": {
            image: "https://image.tmdb.org/t/p/original/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg",
            quote: "Laughter is the best medicine. Sit back and enjoy the fun."
        },
        "Thriller": {
            image: "https://image.tmdb.org/t/p/original/p1F51Lvj3sMopG948F5HsBbl43C.jpg",
            quote: "Edge of your seat suspense and heart-pounding moments."
        },
        "Horror": {
            image: "https://image.tmdb.org/t/p/original/u3bZgnGQ9T01sWNhyve4z7wPzN.jpg",
            quote: "Face your fears. Things that go bump in the night."
        },
        "Drama": {
            image: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
            quote: "Powerful stories that touch the heart and soul."
        },
        "Romance": {
            image: "https://image.tmdb.org/t/p/original/6xKCYgH16U47qWo7afjuzMNoTIq.jpg",
            quote: "Love, passion, and happily ever afters."
        },
        // Fallbacks for others
        "Adventure": { image: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", quote: "Journey into the extraordinary." },
        "Fantasy": { image: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg", quote: "Magic, myths, and legends come to life." },
        "Animation": { image: "https://image.tmdb.org/t/p/original/qjGrUmKW78MCFG8PTLDBp67S27p.jpg", quote: "Stories uniquely told through art and imagination." },
        "Crime": { image: "https://image.tmdb.org/t/p/original/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg", quote: "Detectives, gangsters, and the criminal underworld." },
        "Mystery": { image: "https://image.tmdb.org/t/p/original/3lBDg3i6nn5R2NKkNgmQmVgOhAR.jpg", quote: "Uncover the truth behind the enigma." },
        "War": { image: "https://image.tmdb.org/t/p/original/hjQp148VjWF4KjE7igeVRnUfZ.jpg", quote: "Tales of bravery, sacrifice, and history." },
        "Western": { image: "https://image.tmdb.org/t/p/original/xXHZeb1yhJvnSHPzZDqee0zfMb6.jpg", quote: "Gunsringers, outlaws, and the wild frontier." }
    };

    const categories = Object.keys(genreDetails).filter(k => k !== "All");
    const currentGenre = genreDetails[activeCategory] || genreDetails["All"];

    return (
        <div className="relative w-full h-[50vh] flex items-center justify-center bg-black transition-all duration-700">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 overflow-hidden">
                <img
                    key={activeCategory} // Force re-render for animation
                    src={currentGenre.image}
                    alt={`${activeCategory} Background`}
                    className="w-full h-full object-cover opacity-50 transition-opacity duration-700 animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#141414]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                    {activeCategory === "All" ? "Movies" : `${activeCategory} Movies`}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md font-light">
                    {currentGenre.quote}
                </p>

                {/* Genre Selector Button */}
                <div className="relative inline-block text-left">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 bg-white/10 border border-white/30 px-6 py-2.5 rounded-full hover:bg-white/20 transition text-white backdrop-blur-md"
                    >
                        <span className="font-semibold text-lg">
                            {activeCategory === "All" ? "Genres" : activeCategory}
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-md shadow-xl bg-[#141414] border border-gray-700 ring-1 ring-black ring-opacity-5 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                            <div className="py-1">
                                <button
                                    onClick={() => { onCategoryChange("All"); setIsOpen(false); }}
                                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition ${activeCategory === "All" ? "text-white font-bold bg-gray-800" : "text-gray-300"}`}
                                >
                                    All Genres
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => { onCategoryChange(cat); setIsOpen(false); }}
                                        className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition ${activeCategory === cat ? "text-white font-bold bg-gray-800" : "text-gray-300"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoviesHeader;
