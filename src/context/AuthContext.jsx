import { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/AuthService";
import { SocketService } from "../services/SocketService";
import { SitesService } from "../services/SitesService";
import {
  setStoredSites,
  setCurrentSite,
  getStoredSites,
} from "../util/siteManager";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      SocketService.connect(token);
      fetchSitesIfNeeded();
    }
    setLoading(false);
  }, []);

  const fetchSitesIfNeeded = async () => {
    try {
      const storedSites = getStoredSites();
      if (storedSites.length === 0) {
        const response = await SitesService.getAllSites();
        const sites = response?.data || response || [];
        if (Array.isArray(sites) && sites.length > 0) {
          setStoredSites(sites);
          setCurrentSite(sites[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      const responseData = response?.data || response;

      if (responseData && (responseData.token || responseData.access_token)) {
        const token = responseData.token || responseData.access_token;
        const userData = responseData.user || {
          email: credentials.email,
          loginId: credentials.email,
        };

        console.log("Login successful, token:", token ? "received" : "missing");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);

        SocketService.connect(token);

        fetchSitesIfNeeded();

        return { success: true };
      } else {
        return {
          success: false,
          error:
            "Invalid response from server. Please check console for details.",
        };
      }
    } catch (error) {
      // Handle network errors specifically
      if (
        error.isNetworkError ||
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        return {
          success: false,
          error:
            "Network Error: Unable to connect to the server. Please check your internet connection and try again.",
        };
      }

      // Handle 502 Bad Gateway
      if (error.status === 502 || error.response?.status === 502) {
        // For development allowing mock login when API is down
        if (import.meta.env.DEV) {
          console.warn(
            "API server unavailable (502). Using mock authentication for development."
          );
          const mockToken = "mock-token-" + Date.now();
          const mockUser = {
            email: credentials.email,
            loginId: credentials.email,
            id: 1,
          };

          localStorage.setItem("token", mockToken);
          localStorage.setItem("user", JSON.stringify(mockUser));

          setIsAuthenticated(true);
          setUser(mockUser);

          // Try to connect socket (will fail silently if server is down)
          try {
            SocketService.connect(mockToken);
          } catch (e) {
            console.warn("Socket connection failed:", e);
          }

          return { success: true };
        }

        return {
          success: false,
          error:
            "Server Error (502): The API server is temporarily unavailable. This may be due to server maintenance or network issues. Please try again later or contact support.",
        };
      }

      // Handle 503 Service Unavailable
      if (error.status === 503 || error.response?.status === 503) {
        return {
          success: false,
          error:
            "Service Unavailable (503): The service is temporarily down. Please try again later.",
        };
      }

      // Handle error response structure
      const errorData = error.response?.data || error.response || error;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        error.message ||
        "Login failed. Please check your credentials.";
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    SocketService.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
