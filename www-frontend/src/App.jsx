import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Beers from './components/Beers';
import Users from './components/Users';
import Bars from './components/Bars';
import BarShow from './components/BarShow';
import BeerShow from './components/BeerShow';
import Login from './components/Login';
import Signup from './components/Signup';

const currentUser = localStorage.getItem('current_user');
console.log('Current user:', currentUser.data.handle);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/beers" element={<Beers />} />
        <Route path="/beers/:id" element={<BeerShow />} />
        <Route path="/bars" element={<Bars />} />
        <Route path="/users" element={<Users />} />
        <Route path="/bars/:id" element={<BarShow />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;