import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import ContactPage from "./pages/ContactPage";
import ResearchPage from "./pages/ResearchPage";
import Login from "./pages/login";
import Signup from "./pages/signup";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow mt-16  ">
          <Routes>
            <Route path = '/' element = {<Login/>} />
            <Route path="/home" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="/research" element={<ResearchPage />} />
            
            <Route path = '/signup' element = {<Signup/>} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
