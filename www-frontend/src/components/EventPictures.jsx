import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

function EventPictures() {
  const { id } = useParams();
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/events/${id}/event_pictures`);
        const data = await response.json();
        console.log('Pictures:', data.pictures);
        setPictures(data.pictures); // Asegúrate de acceder a la propiedad correcta
      } catch (error) {
        console.error('Error fetching pictures:', error);
      }
    };

    fetchPictures();
  }, [id]);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Event Pictures
      </Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="space-around">
        {pictures.length > 0 ? (
          pictures.map((picture) => (
            <Paper key={picture.id} style={{ width: '30%', margin: '10px 0' }}>
              <img src={picture.url} alt={picture.title} style={{ width: '100%' }} />
            </Paper>
          ))
        ) : (
          <Typography variant="body1">No pictures available</Typography>
        )}
      </Box>
    </Container>
  );
}

export default EventPictures;
