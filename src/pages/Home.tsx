import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordManager from "../components/PasswordManager";
import { authService } from "../services/authService";

const Home: React.FC = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center p-4">
      {error && (
        <p className="text-red-500 mb-4 text-sm sm:text-base text-center">
          {error}
        </p>
      )}

      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Welcome, {user?.email}</h2>
          <button
            onClick={handleLogout}
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
