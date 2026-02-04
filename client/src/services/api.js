import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    withCredentials: true, // Important: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Basic error handling
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or dispatch logout action
        }
        return Promise.reject(error);
    }
);

export default api;
