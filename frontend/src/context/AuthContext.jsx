import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import {
  getToken,
  getUser,
  getRole,
  setToken,
  clearAuth,
  setupAutoLogout,
  setupActivityTracking,
  isAuthenticated,
  getTimeUntilExpiry,
} from "../utils/tokenManager";
import { toast } from "react-toastify";

const initialState = {
  user: getUser(),
  role: getRole(),
  token: getToken(),
  isLoading: false,
  sessionExpiry: getTimeUntilExpiry(),
  isAuthenticated: isAuthenticated(),
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START": {
      return {
        ...state,
        isLoading: true,
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
      };
    }

    case "LOGIN_SUCCESS": {
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
        isAuthenticated: true,
        sessionExpiry: getTimeUntilExpiry(),
      };
    }

    case "LOGOUT": {
      return {
        ...state,
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
        sessionExpiry: null,
      };
    }

    case "UPDATE_SESSION": {
      return {
        ...state,
        sessionExpiry: getTimeUntilExpiry(),
        isAuthenticated: isAuthenticated(),
      };
    }

    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto-logout handler
  const handleAutoLogout = useCallback(() => {
    clearAuth();
    dispatch({ type: "LOGOUT" });
    toast.warning("Session expired. Please login again.");
    // Redirect to login page
    window.location.href = "/login";
  }, []);

  // Inactivity handler
  const handleInactivity = useCallback(() => {
    clearAuth();
    dispatch({ type: "LOGOUT" });
    toast.warning("Logged out due to inactivity.");
    window.location.href = "/login";
  }, []);

  // Login function
  const login = useCallback((token, user, role) => {
    // Store token and user data in cookies
    setToken(token, user, role);
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { token, user, role },
    });
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuth();
    dispatch({ type: "LOGOUT" });
  }, []);

  // Validate token on app startup
  useEffect(() => {
    const validateTokenOnStartup = () => {
      // Check if token exists and is valid
      const token = getToken(); // This already checks expiration
      const user = getUser();
      const role = getRole();

      // If getToken() returns null, it means token is expired or invalid
      if (!token && state.isAuthenticated) {
        dispatch({ type: "LOGOUT" });
      }

      // If we have token but missing user/role data, also logout
      if (token && (!user || !role)) {
        clearAuth();
        dispatch({ type: "LOGOUT" });
      }

      // If we have all auth data, update the state to match
      if (token && user && role && !state.isAuthenticated) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { token, user, role },
        });
      }
    };

    validateTokenOnStartup();
  }, [state.isAuthenticated]); // Run only once on mount

  // Setup session management
  useEffect(() => {
    let autoLogoutCleanup;
    let activityCleanup;

    if (state.isAuthenticated) {
      // Setup auto-logout on token expiry
      autoLogoutCleanup = setupAutoLogout(handleAutoLogout);

      // Setup activity tracking
      activityCleanup = setupActivityTracking(handleInactivity);

      // Update session info every minute
      const sessionInterval = setInterval(() => {
        dispatch({ type: "UPDATE_SESSION" });
      }, 60 * 1000);

      return () => {
        if (autoLogoutCleanup) autoLogoutCleanup();
        if (activityCleanup) activityCleanup();
        clearInterval(sessionInterval);
      };
    }
  }, [state.isAuthenticated, handleAutoLogout, handleInactivity]);

  // Sync with cookie changes (for multiple tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, check if cookies are still valid
        dispatch({ type: "UPDATE_SESSION" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <authContext.Provider
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
        dispatch,
        login,
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
