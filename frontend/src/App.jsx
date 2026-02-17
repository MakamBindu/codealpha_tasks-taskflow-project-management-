import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <BrowserRouter>
        <button
          onClick={() => setDark(!dark)}
          className="fixed top-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-lg z-50"
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}