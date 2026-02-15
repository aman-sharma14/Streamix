import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import movieService from '../services/movieService';
import interactionService from '../services/interactionService';
import authService from '../services/authService';

const VideoPlayerPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const type = searchParams.get('type') || 'movie';
    const season = searchParams.get('season');
    const episode = searchParams.get('episode');
    const startAtParam = searchParams.get('startAt');

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const lastSavedTime = useRef(0);
    const videoDuration = useRef(0);
    const saveInterval = useRef(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            try {
                let data;
                if (type === 'tv') {
                    data = await movieService.getTVShowById(id);
                } else {
                    data = await movieService.getMovieById(id);
                }
                setMovie(data);

                // Fetch progress if not provided in URL
                if (!startAtParam) {
                    const history = await interactionService.getHistory(currentUser.id);
                    const itemHistory = history.find(h => h.movieId === id && (!season || h.season === parseInt(season)) && (!episode || h.episode === parseInt(episode)));
                    if (itemHistory && itemHistory.startAt > 0 && !itemHistory.completed) {
                        // Re-trigger with startAt if found
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('startAt', Math.floor(itemHistory.startAt));
                        navigate(`/watch/${id}?${newParams.toString()}`, { replace: true });
                    }
                }
            } catch (err) {
                console.error("Failed to load movie details", err);
                setError("Failed to load video details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Listen for postMessage from vidlink
        const handleMessage = (event) => {
            // Safety check for origin if possible, but vidlink might change
            // We just care about the data structure
            const data = event.data;

            if (data.type === 'MEDIA_DATA') {
                videoDuration.current = data.duration;
            }

            if (data.type === 'PLAYER_EVENT' && data.event === 'timeupdate') {
                const currentTime = data.currentTime;
                // Throttle saving to every 15 seconds
                if (currentTime - lastSavedTime.current > 15) {
                    saveProgress(currentTime);
                    lastSavedTime.current = currentTime;
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            if (saveInterval.current) clearInterval(saveInterval.current);
        };
    }, [id, type, season, episode]);

    const saveProgress = async (currentTime) => {
        if (!user || !movie) return;

        const isCompleted = videoDuration.current > 0 && (currentTime / videoDuration.current) > 0.9;

        try {
            await interactionService.updateHistory(
                user.id,
                movie.id,
                currentTime,
                videoDuration.current,
                isCompleted,
                season ? parseInt(season) : null,
                episode ? parseInt(episode) : null,
                movie.title || movie.name,
                movie.posterUrl
            );
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    };

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    if (error || !movie) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-2xl font-bold mb-4">{error || "Video not found"}</h1>
            <button onClick={() => navigate(-1)} className="bg-white text-black px-6 py-2 rounded">Go Back</button>
        </div>
    );

    const tmdbId = movie.tmdbId;
    const startAt = startAtParam ? `&startAt=${startAtParam}` : "";
    const embedUrl = type === 'tv'
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=B20710&autoplay=true${startAt}`
        : `https://vidlink.pro/movie/${tmdbId}?primaryColor=B20710&autoplay=true${startAt}`;

    return (
        <div className="h-screen w-full bg-black relative overflow-hidden">
            {/* Simple Back Overlay */}
            <div className="absolute top-6 left-6 z-50 flex items-center group">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-black/60 transition shadow-xl"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-4 py-2 rounded-lg text-white font-medium backdrop-blur-sm pointer-events-none">
                    Back to Details
                </div>
            </div>

            <iframe
                src={embedUrl}
                title={movie.title || movie.name}
                className="w-full h-full border-none"
                allowFullScreen
                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
            ></iframe>
        </div>
    );
};

export default VideoPlayerPage;
