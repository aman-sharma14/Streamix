import axios from 'axios';

// Gateway URL
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/movie`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Catch 401 Unauthorized errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Session expired or invalid token. Forcing logout.");
            localStorage.clear();
            sessionStorage.clear();
            // Force navigate to login to kill React state and infinite background loops
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const movieService = {
    // Get all movies
    getAllMovies: async () => {
        const response = await api.get('/all');
        return response.data;
    },

    // Get movies by category
    getMoviesByCategory: async (category) => {
        const response = await api.get(`/category/${category}`);
        return response.data;
    },

    // Get movie by ID
    getMovieById: async (id) => {
        const response = await api.get(`/${id}`);
        return response.data;
    },

    searchMovies: async (query) => {
        const response = await api.get(`/search?query=${query}`);
        return response.data;
    },

    // Search TV Shows (DB + TMDB fallback)
    searchTVShows: async (query) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/search?query=${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get popular movies
    getPopularMovies: async () => {
        const response = await api.get('/popular');
        return response.data;
    },

    // NEW: Get top rated movies
    getTopRatedMovies: async () => {
        const response = await api.get('/top-rated');
        return response.data;
    },

    // NEW: Get similar movies
    getSimilarMovies: async (tmdbId) => {
        const response = await api.get(`/${tmdbId}/similar`);
        return response.data;
    },

    // NEW: Get all genres
    getGenres: async () => {
        const response = await api.get('/genres');
        return response.data;
    },

    // NEW: Get movie cast
    getMovieCast: async (tmdbId) => {
        const response = await api.get(`/${tmdbId}/cast`);
        return response.data;
    },

    // NEW: Get movie images (logos)
    getMovieImages: async (tmdbId) => {
        const response = await api.get(`/${tmdbId}/images`);
        return response.data;
    },

    // NEW: Get movie videos
    getMovieVideos: async (tmdbId) => {
        const response = await api.get(`/${tmdbId}/videos`);
        return response.data;
    },

    // NEW: Get trending movies
    getTrendingMovies: async () => {
        const response = await api.get('/trending');
        return response.data;
    },

    // NEW: Get all TV shows (use axios directly to avoid /movie prefix)
    getAllTVShows: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get popular TV shows
    getPopularTVShows: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/popular`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get top rated TV shows
    getTopRatedTVShows: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/top-rated`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get trending TV shows
    getTrendingTVShows: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/trending`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get TV Show by ID
    getTVShowById: async (id) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get TV Show Cast
    getTVShowCast: async (tmdbId) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/tmdb/${tmdbId}/cast`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get Similar TV Shows
    getSimilarTVShows: async (tmdbId) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/tmdb/${tmdbId}/similar`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get TV Show Details from TMDB Proxy
    getTVShowDetailsFromProxy: async (tmdbId) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/tmdb/${tmdbId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // NEW: Get TV Show Season Details from TMDB Proxy
    getTVShowSeasonDetails: async (tmdbId, seasonNumber) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tv/tmdb/${tmdbId}/season/${seasonNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Sync (Admin only, but good to have)
    syncMovies: async () => {
        await api.get('/sync');
    }
};

export default movieService;
