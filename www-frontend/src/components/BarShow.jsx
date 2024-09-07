import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './BarShow.css';

function BarShow() {
  const { id } = useParams();
  const [bar, setBar] = useState();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/bars/${id}`);
        const data = await response.json();
        setBar(data.bar);
      } catch (error) {
        console.error('Error fetching bar:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/bars/${id}/events`);
        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchBar();
    fetchEvents();
    setLoading(false);
  }, [id]);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (!bar) {
    return <Typography variant="h6">Bar not found.</Typography>;
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', width: isSmallScreen ? '100%' : '100vh', width: isMediumScreen ? "100%" : "100vh", display: 'flex', flexDirection: 'column' , fontFamily: 'Belwe', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
      <Container maxWidth={false} disableGutters sx={{ width: isSmallScreen ? '100%' : '85%', width: isMediumScreen ? "100%" : "85%", marginBottom: '10px' }}>
      <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ padding: 1 }}>
              <Typography variant="h5" sx={{ fontFamily: 'Belwe' }}>
                {bar.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {bar.address.line1 || 'N/A'}, {bar.address.line2 || 'N/A'}
              </Typography>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <img 
              src="https://via.placeholder.com/400" // Cambia la URL por la imagen real del bar
              alt={bar.name}
              style={{ width: '100%', height: 'auto', maxHeight: '40vh', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{padding: 0 }}>
              <Typography variant="body2" color="textSecondary">
                {bar.address.city || 'N/A'}, {bar.address.country ? bar.address.country.name : 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">Lat: {bar.latitude || 'N/A'}, Long: {bar.longitude || 'N/A'}</Typography>
          </Box>
          <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" class="buttonGo">
                Go
              </Button>
              <Button variant="contained" class="buttonNewEvent">
                New Event
              </Button>
              <IconButton color="secondary">
                <FavoriteBorderIcon/>
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Container maxWidth={false} disableGutters sx={{ width: isSmallScreen ? '90%' : '70%', width: isMediumScreen ? "90%" : "70%" }}>
        <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: "5px" }}>
          <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Events</Typography>
            {events.length > 0 ? (
              events.map(event => (
                <Box key={event.id} sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{event.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button  variant="text" class= "buttonEvent">
                    View
                  </Button>
                </Box>
              ))
            ) : (
              <Typography sx={{ padding: 1 }}>No events found.</Typography>
            )}
          </Box>
      </Paper>
      </Container>
    </Container>
  );
}

export default BarShow;