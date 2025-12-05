// Token management utilities using cookies with automatic expiration

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";
const ROLE_KEY = "authRole";
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// LocalStorage utility functions (more reliable than cookies for client-side access)
const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage ${key}:`, error);
    return false;
  }
};

const getLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting localStorage ${key}:`, error);
    return null;
  }
};

const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage ${key}:`, error);
    return false;
  }
};

// JWT token decoder (without verification - for client-side expiry check only)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Set token with expiration in localStorage
export const setToken = (token, user, role) => {
  try {
    // Store token and user data in localStorage
    setLocalStorage(TOKEN_KEY, token);
    setLocalStorage(USER_KEY, JSON.stringify(user));
    setLocalStorage(ROLE_KEY, role);

    // Also store a timestamp to track when login happened
    setLocalStorage("loginTime", Date.now().toString());

    console.log("✅ Token stored in localStorage");
    return true;
  } catch (error) {
    console.error("Error storing token in localStorage:", error);
    return false;
  }
};

// Get token from localStorage
export const getToken = () => {
  try {
    const token = getLocalStorage(TOKEN_KEY);
    if (!token) {
      return null;
    }

    // Decode JWT to check expiry
    const decoded = decodeJWT(token);
    if (decoded && decoded.exp) {
      const now = Date.now() / 1000; // JWT exp is in seconds
      if (now >= decoded.exp) {
        console.log("🔒 Token expired, clearing localStorage");
        clearAuth();
        return null;
      }

      // Check if token needs refresh soon
      if (now >= decoded.exp - REFRESH_THRESHOLD / 1000) {
        console.log("⚠️ Token expires soon, consider refreshing");
      }
    }

    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    clearAuth();
    return null;
  }
};

// Get user data from localStorage
export const getUser = () => {
  try {
    const token = getToken(); // This will validate expiry
    if (!token) {
      return null;
    }

    const userStr = getLocalStorage(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    clearAuth();
    return null;
  }
};

// Get role from localStorage
export const getRole = () => {
  try {
    const token = getToken(); // This will validate expiry
    if (!token) {
      return null;
    }

    return getLocalStorage(ROLE_KEY);
  } catch (error) {
    console.error("Error getting role:", error);
    clearAuth();
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Check if token is about to expire
export const isTokenExpiringSoon = () => {
  try {
    const token = getLocalStorage(TOKEN_KEY);
    if (!token) return false;

    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return false;

    const now = Date.now() / 1000; // JWT exp is in seconds
    return now >= decoded.exp - REFRESH_THRESHOLD / 1000;
  } catch (error) {
    return false;
  }
};

// Get time until token expires
export const getTimeUntilExpiry = () => {
  try {
    const token = getLocalStorage(TOKEN_KEY);
    if (!token) return 0;

    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return 0;

    const now = Date.now() / 1000; // JWT exp is in seconds
    const timeLeft = (decoded.exp - now) * 1000; // Convert back to milliseconds

    return Math.max(0, timeLeft);
  } catch (error) {
    return 0;
  }
};

// Clear all authentication data from localStorage
export const clearAuth = () => {
  removeLocalStorage(TOKEN_KEY);
  removeLocalStorage(USER_KEY);
  removeLocalStorage(ROLE_KEY);
  removeLocalStorage("loginTime");
  console.log("🔒 Authentication data cleared from localStorage");
};

// Auto-logout setup
export const setupAutoLogout = (onLogout) => {
  const checkTokenExpiry = () => {
    if (!isAuthenticated()) {
      onLogout();
      return;
    }

    const timeUntilExpiry = getTimeUntilExpiry();
    if (timeUntilExpiry <= 0) {
      console.log("🔒 Token expired, logging out");
      onLogout();
    }
  };

  // Check every minute
  const interval = setInterval(checkTokenExpiry, 60 * 1000);

  // Initial check
  checkTokenExpiry();

  // Return cleanup function
  return () => clearInterval(interval);
};

// Session activity tracking
let lastActivity = Date.now();
const INACTIVITY_TIMEOUT = 8 * 60 * 1000; // 8 minutes (shorter than token expiry)

export const updateActivity = () => {
  lastActivity = Date.now();
};

export const checkInactivity = () => {
  const now = Date.now();
  return now - lastActivity > INACTIVITY_TIMEOUT;
};

// Setup activity tracking
export const setupActivityTracking = (onInactive) => {
  const events = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  const resetTimer = () => {
    updateActivity();
  };

  // Add event listeners
  events.forEach((event) => {
    document.addEventListener(event, resetTimer, true);
  });

  // Check inactivity every minute
  const interval = setInterval(() => {
    if (isAuthenticated() && checkInactivity()) {
      console.log("🔒 User inactive, logging out");
      onInactive();
    }
  }, 60 * 1000);

  // Return cleanup function
  return () => {
    events.forEach((event) => {
      document.removeEventListener(event, resetTimer, true);
    });
    clearInterval(interval);
  };
};

// Format time remaining for display
export const formatTimeRemaining = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};
