import axios from 'axios';

// Gateway URL
const API_URL = 'http://localhost:8080/movie';

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

    // Sync (Admin only, but good to have)
    syncMovies: async () => {
        await api.get('/sync');
    }
};

export default movieService;
