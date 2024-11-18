import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://46e2-200-124-57-6.ngrok-free.app/api/v1/",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;