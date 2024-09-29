import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, IconButton, List, ListItem, ListItemText, Divider, Typography, Paper, useTheme, useMediaQuery, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import BeerLogo from '../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta
import './Beers.css'; // Import the CSS file

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const current_user = JSON.parse(localStorage.getItem('current_user'));

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Función para manejar la búsqueda de usuarios
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/users`);
      const data = await response.json();
      
      console.log('Datos recibidos:', data);  // Debug
      const filteredUsers = data.filter(user => 
        user.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Usuarios filtrados:', filteredUsers);  // Debug
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

  const handleViewClick = (id) => {
    navigate(`/users/${id}`);
  };

  // Renderización del componente
  return (
    current_user ? (
    <Container sx={{ maxHeight: '100vh', overflowY: 'auto', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
      <div className="imageContainer">
        <img
          src={BeerLogo}
          alt="Beer Logo"
        />
      </div>
      <Typography variant="h4" sx={{ fontFamily: "Belwe" }}>
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
                  <Button variant="contained" class="buttonView" onClick={() => handleViewClick(user.id)}>
                    View
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
    ) : (
      <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
        <div className="imageContainer">
          <img
            src={BeerLogo}
            alt="Beer Logo"
          />
        </div>
        <Box className="boxTodo">
          <Typography variant="h3" sx={{ fontFamily: "Belwe", color: "#000000", padding: "20px", marginTop: "50px"}}>
            Error 401
          </Typography>
        </Box>
      </Container>
    )
  );
}

export default Users;