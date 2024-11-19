import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://7628-191-113-128-201.ngrok-free.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;