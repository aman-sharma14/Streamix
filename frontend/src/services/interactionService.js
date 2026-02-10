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
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const interactionService = {
    // Add movie to user's watchlist
    addToWatchlist: async (userId, movieId) => {
        try {
            const response = await api.post('/watchlist/add', {
                userId: userId,
                movieId: movieId
            });
            return response.data;
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            throw error;
        }
    }
};

export default interactionService;
