// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";
import { post, setAuthToken } from "../data/apiClient";
import { LoginResponse, User } from "../models/User";

interface AuthContextValue {
  user: User | null;
  login: (email: string, selfie?: Blob) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const json = localStorage.getItem("user");
    if (json) {
      try {
        const u: User = JSON.parse(json);
        if (u.token) {
          setAuthToken(u.token);
        }
        return u;
      } catch {
        return null;
      }
    }
    return null;
  });

  const isLoggedIn = !!user;

  const login = async (email: string, selfie?: Blob) => {
    const formData = new FormData();
    formData.append("email", email);
    if (selfie) {
      formData.append("selfie", selfie, "selfie.jpg");
    }
    const response = await post<FormData, LoginResponse>(
      "/users/login",
      formData
    );
    const loggedInUser: User = {
      id: response.user.id,
      email: response.user.email,
      faceImage: response.user.faceImage,
      token: response.token,
    };
    setAuthToken(response.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
