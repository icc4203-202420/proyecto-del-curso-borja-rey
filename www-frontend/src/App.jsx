import React from 'react';
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
import './App.css';

function App() {
  const current_user = JSON.parse(localStorage.getItem('current_user'));
  console.log('current_user: ', current_user);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {current_user ? (
        <>
          <Route path="/beers" element={<Beers />} />
          <Route path="/beers/:id" element={<BeerShow />} />
          <Route path="/bars" element={<Bars />} />
          <Route path="/users" element={<Users />} />
          <Route path="/bars/:id" element={<BarShow />} />
        </>
        ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </>
        )}
      </Routes>
    </Router>
  );
}

export default App;