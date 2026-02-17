import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    const currentVideoTime = useRef(0); // Track latest time for unmount save
    const videoDuration = useRef(0);
    const saveInterval = useRef(null);
    const userIdRef = useRef(null); // Ref to hold latest user ID



    // Callbacks must be defined before useEffect to be used in dependencies
    const saveProgress = useCallback(async (currentTime, explicitUserId = null) => {
        // Use ref or explicit ID to avoid stale closure
        const userIdToUse = explicitUserId || userIdRef.current;

        if (!userIdToUse) {
            console.warn("Skipping history save: User ID is missing or invalid.");
            return;
        }
        // Check movie state directly
        if (!movie) {
            // setDebugLog(prev => `Save Err: No Movie Data\n${prev}`.slice(0, 300));
            return;
        }

        // Handle poster URL: Use full URL if available, otherwise construct from path
        let poster = null;
        if (movie.posterUrl) {
            poster = movie.posterUrl;
        } else if (movie.poster_path) {
            poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        }

        const progressData = {
            userId: userIdToUse,
            movieId: id,
            startAt: currentTime,
            duration: videoDuration.current,
            completed: videoDuration.current > 0 && (currentTime / videoDuration.current) > 0.9,
            season: season ? parseInt(season) : null,
            episode: episode ? parseInt(episode) : null,
            movieTitle: movie.title || movie.name,
            posterUrl: poster
        };

        try {
            await interactionService.updateHistory(progressData);
            console.log(`History saved for Movie ${id} at ${Math.floor(currentTime)}s`);
        } catch (error) {
            console.error("Failed to save history", error);
        }
    }, [id, season, episode, movie]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            navigate('/login');
            return;
        }
        // setUser(currentUser); // Unused
        userIdRef.current = currentUser.id; // Update ref immediately

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

        // Cleanup function for unmount save
        return () => {
            // Save on unmount if we have progress
            if (currentVideoTime.current > 0) {
                console.log("Saving progress on unmount...", currentVideoTime.current);
                // We cannot call saveProgress here easily if it depends on 'movie' which is a closure.
                // However, 'movie' state should be stable. 
                // To be safe, we might skip UNMOUNT save for now or move saveProgress logic to a ref if needed.
                // For now, let's trust the closure has the movie.
                // NOTE: We recreate the logic here to avoid dependency on saveProgress closure if needed, 
                // but relying on saveProgress is cleaner if dependencies are managed.
                saveProgress(currentVideoTime.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, type, season, episode, navigate, searchParams, startAtParam]); // Keep dependencies stable to avoid re-fetching

    // SEPARATE EFFECT FOR EVENT LISTENER
    // This allows us to use 'movie' in dependencies if needed, or better yet, keeps it clean.
    useEffect(() => {
        const handleMessage = (event) => {
            // if (event.origin !== 'https://vidlink.pro') return;

            const msg = event.data;
            // Removed aggressive logging to prevent re-renders
            // try {
            //     // Log to console as requested
            //     // console.log("DEBUG RX:", msg); 

            //     setDebugLog(prev => `Rx: ${JSON.stringify(msg).slice(0, 50)}\n${prev}`.slice(0, 300));
            // } catch (e) {
            //     setDebugLog(prev => `Rx: [Non-serializable]\n${prev}`.slice(0, 300));
            // }

            if (msg && msg.type === 'MEDIA_DATA') {
                console.log("DEBUG: MEDIA_DATA received:", msg);
                const mediaData = msg.data;
                if (mediaData && mediaData.progress && mediaData.progress.duration) {
                    videoDuration.current = mediaData.progress.duration;
                    // setDebugLog(prev => `Duration: ${mediaData.progress.duration}\n${prev}`.slice(0, 300));
                }
            }

            if (msg && msg.type === 'PLAYER_EVENT') {
                const payload = msg.data;

                if (payload) {
                    if (payload.duration) {
                        videoDuration.current = payload.duration;
                    }

                    if (payload.event === 'timeupdate') {
                        const currentTime = payload.currentTime;
                        currentVideoTime.current = currentTime; // Update ref

                        // Throttle saving to every 15 seconds
                        if (currentTime - lastSavedTime.current > 15) {
                            saveProgress(currentTime);
                            lastSavedTime.current = currentTime;
                        }
                    } else {
                        // Only log interesting events
                        if (payload.event !== 'timeupdate') {
                            // console.log("DEBUG: Player Event:", payload.event, payload);
                            // setDebugLog(prev => `Event: ${payload.event}\n${prev}`.slice(0, 300));
                        }
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [movie, saveProgress]); // Add movie and saveProgress dependency so handleMessage closure has access to it!

    // IMMEDIATE SAVE ON MOUNT (Once movie is loaded)
    useEffect(() => {
        if (movie && userIdRef.current && lastSavedTime.current === 0) {
            console.log("Initial history save (Start)");
            saveProgress(0, userIdRef.current);
            // setDebugLog(prev => `Init Save Triggered (Movie Ready)\n${prev}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movie, saveProgress]); // Run when movie is set

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



    // Confirm render


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
            ></iframe>
        </div>
    );
};

export default VideoPlayerPage;
