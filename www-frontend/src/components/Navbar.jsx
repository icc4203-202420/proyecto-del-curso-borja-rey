import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#F8F4E1', color:"#000000" }}> {/* Cambia position a "fixed" */}
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" className="navbar-link">Mistbeer</Link>
        </Typography>
        <Button color="inherit">
          <Link to="/users" className="navbar-link">Users</Link>
        </Button>
        <Button color="inherit">
          <Link to="/bars" className="navbar-link">Bars</Link>
        </Button>
        <Button color="inherit">
          <Link to="/beers" className="navbar-link">Beers</Link>
        </Button>
        <Button color="inherit">
          <Link to="/" className="navbar-link">Home</Link>
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;