import axios from 'axios';
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const api = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json',
    },
});
export default api;
