// API Configuration
const config = {
  development: {
    API_URL: 'http://localhost:5000',
    SOCKET_URL: 'http://localhost:5000'
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'https://your-backend-url.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_URL = config[environment].API_URL;
export const SOCKET_URL = config[environment].SOCKET_URL;

export default config[environment];