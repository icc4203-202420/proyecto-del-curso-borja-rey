import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, IconButton, List, ListItem, ListItemText, Divider, Typography, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import BeerLogo from '../assets/beerLogo.png';
import './Beers.css';
// si
function Bars() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleSearchBar = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/bars`);
      const data = await response.json();
      
      console.log('Datos recibidos:', data);  // Debug
  
      // Verifica si data.bars es un array
      if (Array.isArray(data.bars)) {
        const filteredBars = data.bars.filter(bar => 
          bar.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        console.log('Bares filtrados:', filteredBars);  // Debug
        
        setBars(filteredBars);
      } else {
        console.error('Los datos recibidos no contienen un array de bares');
      }
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearchBar();
  }, []);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    console.log('Bares en el estado:', bars);  // Debug
  }, [bars]);

  const handleViewClick = (id) => {
    navigate(`/bars/${id}`);
  };
  return (
    <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
      <div className="imageContainer">
        <img
          src={BeerLogo}
          alt="Beer Logo"
        />
      </div>
      <Typography variant="h4" sx={{ fontFamily: "Belwe" }}>
        Bars
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
          <IconButton onClick={handleSearchBar} sx={{ marginLeft: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        <Paper elevation={3} sx={{ backgroundColor: '#F8F4E1', fontFamily: "Belwe", overflowY: 'auto', maxHeight: '70vh' }}>
          <List>
            {loading && <Typography>Loading...</Typography>}
            {!loading && bars.length === 0 && <Typography>No bars found.</Typography>}
            {bars.map((bar) => (
              <React.Fragment key={bar.id}>
                <ListItem>
                  <ListItemText
                    primary={bar.name}
                    secondary={
                      bar.address ? (
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {bar.address.line1 || 'N/A'} , {bar.address.line2 || 'N/A'}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            {bar.address.country ? bar.address.country.name : 'N/A'} , {bar.address.city || 'N/A'}
                          </Typography>
                        </>
                      ) : (
                        <Typography component="span" variant="body2" color="text.secondary">
                          Address not available
                        </Typography>
                      )
                    }
                  />
                  <Button variant="contained" class="buttonView" onClick={() => handleViewClick(bar.id)}>
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
  );
}

export default Bars;