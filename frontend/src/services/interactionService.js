import axios from 'axios';

// Gateway URL (adjust port if needed, assuming 8080 based on other services)
const API_URL = 'http://localhost:8080/interaction';

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

const interactionService = {
    // Add movie to user's watchlist
    addToWatchlist: async (userId, movieId, movieTitle, posterUrl) => {
        try {
            const response = await api.post('/watchlist/add', {
                userId: userId,
                movieId: movieId,
                movieTitle: movieTitle,
                posterUrl: posterUrl
            });
            return response.data;
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            throw error;
        }
    },

    // Remove movie from user's watchlist
    removeFromWatchlist: async (userId, movieId) => {
        try {
            await api.post('/watchlist/remove', {
                userId: userId,
                movieId: movieId
            });
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            throw error;
        }
    },

    // Get user's watchlist
    getWatchlist: async (userId) => {
        try {
            const response = await api.get(`/watchlist/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching watchlist:", error);
            return [];
        }
    },

    // Update watch history
    updateHistory: async (data) => {
        try {
            const response = await api.post('/history/update', data);
            return response.data;
        } catch (error) {
            console.error("Error updating watch history:", error);
            throw error;
        }
    },

    // Get user's watch history
    getHistory: async (userId) => {
        try {
            const response = await api.get(`/history/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching watch history:", error);
            return [];
        }
    }
};

export default interactionService;
