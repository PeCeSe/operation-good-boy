import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

console.log(
  "%c                       /)\n" +
  "              /\\___/\\ ((\n" +
  "              \\`@_@'/  ))\n" +
  "              {_:Y:.}_//\n" +
  "   ----------{_}^-'{_}----------\n\n" +
  "  Hey, a curious cat! 🐾\n" +
  "  Poking around in here? Respect.\n" +
  "  Operation: Good Boy is hand-crafted\n" +
  "  with love, React, and mild chaos.\n",
  "color: #8B6914; font-family: monospace; font-size: 12px; line-height: 1.4;"
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
