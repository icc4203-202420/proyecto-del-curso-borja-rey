import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BeerLogo from '../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta
import './Home.css';  // Importa el archivo CSS

function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Lógica de búsqueda aquí
    console.log('Buscando:', searchQuery);
  };

  return (
    <Box className="box">
      <div className="imageContainer">
        <img
          src={BeerLogo}
          alt="Beer Logo"
        />
        <Typography variant="h2" component="h1" gutterBottom className="titulo">
          Mistbeer
        </Typography>
      </div>
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
    </Box>
  );
}

export default Home;