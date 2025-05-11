// src/pages/Home.tsx (or wherever Home lives)
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordManager from "../components/PasswordManager";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!user) return null; // or a spinner

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Welcome, {user.email}</h2>
          <button
            onClick={() => logout()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <PasswordManager />
      </div>
    </div>
  );
};

export default Home;
