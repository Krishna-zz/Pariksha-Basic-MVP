import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "teacher" | "student";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial load, check if we have a valid session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No token");

        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // Clears the backend cookie
    } catch {
      console.error("Logout failed");
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

    // eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};