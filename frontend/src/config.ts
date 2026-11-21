const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const envApiUrl = import.meta.env.VITE_API_URL;

if (!isLocalhost && !envApiUrl) {
  console.warn(
    '[ResuOne] VITE_API_URL environment variable is not defined. Defaulting to production Render backend: https://may-final-resuone.onrender.com'
  );
}

export const API_URL = isLocalhost
  ? 'http://localhost:5000'
  : (envApiUrl ? envApiUrl.replace(/\/+$/, '') : 'https://may-final-resuone.onrender.com');

// Dev mode detection: allow bypass via env or detect DEV
export const IS_DEV_MODE = isLocalhost && (import.meta.env.DEV || import.meta.env.VITE_DEV_BYPASS_AUTH === 'true');

// Mock user for dev-mode bypass
export const DEV_MOCK_USER = {
  id: 'dev-user-1',
  email: 'dev@localhost',
  name: 'Dev User',
  avatar: undefined
};