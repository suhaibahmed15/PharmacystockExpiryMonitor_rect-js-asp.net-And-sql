import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/variables.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/topbar.css";
import "./styles/tables.css";
import "./styles/responsive.css";
import "./styles/App.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);