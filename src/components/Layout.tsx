import React from "react";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => (
  <div className="container mt-20 mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold my-8 text-center">
      Password Manager with Face Recognition
    </h1>
    <Outlet />
  </div>
);

export default Layout;
