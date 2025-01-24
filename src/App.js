// src/App.js
import React from "react";
import { ThemeContextProvider } from "./context/ThemeContext"; // Import context
import Navbar from "./components/Navbar";
import ZipFileLoader from "./components/ZipFileLoader";

function AppContent() {

  return (
    <div>
      <Navbar />
      <ZipFileLoader />
      <h1>Footer!</h1>
    </div>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;
