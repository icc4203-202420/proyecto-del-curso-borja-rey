import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Search from './components/Search';
import Beers from './components/Beers';

function App() {
  return (
    <Router>
      <Navbar /> {/* Incluye el componente Navbar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/beers" element={<Beers />} />
      </Routes>
    </Router>
  );
}

export default App;