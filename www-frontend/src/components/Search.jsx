import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, IconButton, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para manejar la búsqueda de cervezas
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/beers?search=${searchTerm}`);
      const data = await response.json();
      setBeers(data);
    } catch (error) {
      console.error('Error fetching beers:', error);
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container sx={{ marginTop: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#d7b49e',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <TextField
          fullWidth
          placeholder="Bar"
          variant="outlined"
          value={searchTerm}
          onChange={handleChange}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '4px',
          }}
        />
        <IconButton onClick={handleSearch} sx={{ marginLeft: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Lista de cervezas */}
      <List>
        {loading && <Typography>Cargando...</Typography>}
        {!loading && beers.length === 0 && <Typography>No se encontraron cervezas.</Typography>}
        {beers.map((beer) => (
          <React.Fragment key={beer.id}>
            <ListItem>
              <ListItemText
                primary={beer.name}
                secondary={`${beer.distance} km ${beer.address}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
}

export default Search;