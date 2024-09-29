import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import './BarShow.css';

function EventPictures() {
  const { id } = useParams();
  const [pictures, setPictures] = useState([]);
  const current_user = JSON.parse(localStorage.getItem('current_user'));
  const navigate = useNavigate();

  const handleViewPictureClick = (id) => {
    navigate(`/events_picture/${id}`);
  };

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/events/${id}/event_pictures`);
        const data = await response.json();
        console.log('Pictures:', data.pictures);
        setPictures(data.pictures);
      } catch (error) {
        console.error('Error fetching pictures:', error);
      }
    };

    fetchPictures();
  }, [id]);

  return (
    current_user ? (
    <Container>
      <Typography variant="h4" sx={{ fontFamily: "Belwe" }}>
        Event Pictures
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {pictures.length > 0 ? (
          pictures.map((picture) => (
            <Grid item key={picture.id}>
              <Paper elevation={3} sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={picture.picture_url}
                  style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                />
                <Typography variant="body1" align="center" sx={{ fontFamily: "Belwe" }}>
                  {picture.description}
                </Typography>
                <Button 
                  className="button-custom" 
                  sx={{ 
                    backgroundColor: '#AF8F6F', 
                    textTransform: 'none',
                    fontFamily: 'Belwe', 
                    color: 'white', 
                    '&:hover': { 
                      backgroundColor: '#8f7558'  // Un color más oscuro en el hover
                    } 
                  }} 
                  onClick={() => handleViewPictureClick(picture.id)}
                >
                  View
                </Button>
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">No pictures available</Typography>
        )}
      </Grid>
    </Container>
    ) : (
      <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: '30%' }}>
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

export default EventPictures;