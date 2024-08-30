import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerWidth = 300;

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#F8F4E1', color: '#000000' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" className="navbar-link">Mistbeer</Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: drawerWidth,
            backgroundColor: '#F8F4E1',
            paddingTop: '64px',
          },
        }}
      >
        <List>
          <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/" className="navbar-link">Home</Link>
            </Typography>
          </ListItem>
          <ListItem button component={Link} to="/bars" onClick={toggleDrawer(false)}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/bars" className="navbar-link">Bars</Link>
            </Typography>
          </ListItem>
          <ListItem button component={Link} to="/beers" onClick={toggleDrawer(false)}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/beers" className="navbar-link">Beers</Link>
            </Typography>
          </ListItem>
          <ListItem button component={Link} to="/users" onClick={toggleDrawer(false)}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link to="/users" className="navbar-link">Users</Link>
            </Typography>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;