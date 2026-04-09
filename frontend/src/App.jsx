// App.jsx
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RatePage from "./pages/RatePage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <>
      <nav className="nav">
        <h1>🍽️ Hostel Food</h1>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/rate">Rate a Meal</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rate" element={<RatePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}
