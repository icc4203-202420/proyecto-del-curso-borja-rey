import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, IconButton, List, ListItem, ListItemText, Divider, Typography, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BeerLogo from '../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta
import './Beers.css'; // Import the CSS file

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para manejar la búsqueda de usuarios
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/users`);
      const data = await response.json();
      
      const filteredUsers = data.users.filter(user => 
        user.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  // Llamar a handleSearch cuando el componente se monte
  useEffect(() => {
    handleSearch();
  }, []);

  // Función para manejar el cambio en el campo de búsqueda
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Renderización del componente
  return (
    <Container sx={{ maxHeight: '100vh', overflowY: 'auto' }}>
      <div className="imageContainer">
        <img
          src={BeerLogo}
          alt="Beer Logo"
        />
      </div>
      <Typography variant="h4" sx={{ fontFamily: "Belwe", marginTop: '10px' }}>
        Users
      </Typography>
      <Box className="boxTodo">
        <Box 
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#d7b49e',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '10px',
            marginTop: '15px'
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            className="searchInput"
            value={searchTerm}
            onChange={handleChange}
          />
          <IconButton onClick={handleSearch} sx={{ marginLeft: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Lista de usuarios envuelta en un Paper */}
        <Paper elevation={3} sx={{ backgroundColor: '#F8F4E1', fontFamily: "Belwe", overflowY: 'auto', maxHeight: '70vh' }}>
          <List>
            {loading && <Typography>Loading...</Typography>}
            {!loading && users.length === 0 && <Typography>No users found.</Typography>}
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name} (${user.handle})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Email: {user.email}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Edad: {user.age}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default Users;