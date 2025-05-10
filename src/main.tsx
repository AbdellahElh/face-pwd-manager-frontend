import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Register from "./pages/Register";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
];

const Root: React.FC = () => {
  const element = useRoutes(routes);
  return (
    <div className="container mt-20 mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold my-8 text-center">
        Password Manager with Face Recognition
      </h1>
      {element && <>{element}</>}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);
