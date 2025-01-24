// src/App.js
import React from "react";
import { ThemeContextProvider } from "./context/ThemeContext"; // Import context
import Navbar from "./components/Navbar";
import ZipFileLoader from "./components/ZipFileLoader";
import Footer from "./components/Footer";

function AppContent() {

  return (
    <div>
      <Navbar />
      <ZipFileLoader />
      <Footer/>
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
