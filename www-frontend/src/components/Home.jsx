import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Box, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import BeerLogo from '../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta
import './Home.css';  // Importa el archivo CSS

function Home() {
  const current_user = JSON.parse(localStorage.getItem('current_user'));
  const [searchQuery, setSearchQuery] = useState('');
  const [login, setLogin] = useState(false);
  const [signup, setSignup] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    // Lógica de búsqueda aquí
    console.log('Buscando:', searchQuery);
  };

  const handleLogin = () => {
    navigate('/login');
  }

  const handleSignup = () => {
    navigate('/signup');
  }

  return (
    <Box className="box-nada">
      <div className="imageContainerHome">
        <img
          src={BeerLogo}
          alt="Beer Logo"
        />
        <Typography variant="h2" component="h1" gutterBottom className="titulo">
          Mistbeer
        </Typography>
      </div>
      {current_user ? (
        <>
          <TextField
            label="Search"
            variant="outlined"
            className="searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box className="buttonBox">
            <Button
              onClick={() => {}}
              variant="contained"
              className="buttonMap"
            >
              Open Map
            </Button>
          </Box>
        </>
      ) : (
        <Box className="buttonBox">
          <Button
            onClick={() => {handleLogin()}}
            variant="contained"
            className="buttonLogin"
          >
            Log in
          </Button>
          <Button
            onClick={() => {handleSignup()}}
            variant="contained"
            className="buttonSignup"
          >
            Sign up
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Home;