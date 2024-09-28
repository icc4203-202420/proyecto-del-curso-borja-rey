import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EventPictures() {
  const { id } = useParams();
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
      const fetchPictures = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/v1/events/${id}/pictures`);
          const data = await response.json();
          console.log('Pictures:', data.pictures);
          setPictures(data);
        } catch (error) {
          console.error('Error fetching beer:', error);
        }
      };
      fetchPictures();
  }, []);


  return (
      <Container>
          <Typography variant="h4" component="h1" gutterBottom>
              Event Pictures
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="space-around">
              {pictures.map(picture => (
                  <Paper key={picture.id} style={{ width: '30%', margin: '10px 0' }}>
                      <img src={picture.url} alt={picture.title} style={{ width: '100%' }} />
                  </Paper>
              ))}
          </Box>
      </Container>
  );
};

export default EventPictures;