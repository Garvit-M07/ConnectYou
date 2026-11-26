import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Chatting from "./pages/Chatting.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chatting" element={<Chatting />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);