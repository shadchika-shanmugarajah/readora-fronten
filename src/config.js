const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = isLocal 
  ? 'http://localhost:5001/api' 
  : 'https://readora-backend1.onrender.com/';
