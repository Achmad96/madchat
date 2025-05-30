import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { fetchData } from "@/services/FetchService";
import type { JwtPayload, UserType } from "@/types";

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: UserType, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (pathname === "/sign-in" || pathname === "/sign-up") {
        return;
      }
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        navigate("/sign-in", { replace: true });
        toast.error("You must be signed in to access this page.");
        return;
      }
      if (user && isAuthenticated) {
        return;
      }
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const userId = decoded.id;
        const response = await fetchData(`users/${userId}`, { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
        console.error("Error validating token:", error);
        setUser(null);
        setIsAuthenticated(false);
        toast.error("ERROR: trying to connecting to the server. Please try again later.", { description: "Error occured while trying to connecting to the server", duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = (userData: UserType, token: string) => {
    setUser(userData);
    setToken(token);
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    toast.success("You have been logged out successfully.", { description: "See you next time!" });
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
