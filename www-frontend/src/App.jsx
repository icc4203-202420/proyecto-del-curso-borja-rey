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
import Review from './components/Review';
import OpenMap from './components/OpenMap';
import EventShow from './components/EventShow';
import EventPictures from './components/EventPictures';
import UserShow from './components/UserShow';
import EventPicture from './components/EventPicture';
import './App.css';

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
          <Route path="/events/:id" element={<EventShow />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/beers/:id/reviews" element={<Review />} />
          <Route path="/map" element={<OpenMap />} />
          <Route path="/events/:id/pictures" element={<EventPictures />} />
          <Route path="/users/:id" element={<UserShow />} />
          <Route path="/events/:id/picture" element={<EventPicture />} />
      </Routes>
    </Router>
  );
}

export default App;