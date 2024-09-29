import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
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
        setPictures(data.pictures);
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
      <Grid container spacing={3} justifyContent="center">
        {pictures.length > 0 ? (
          pictures.map((picture) => (
            <Grid item key={picture.id} xs={12} sm={6} md={4} lg={3}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <img
                  src={picture.picture_url}
                  alt={picture.description}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <Typography variant="body1" align="center" mt={1}>
                  {picture.description}
                </Typography>
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">No pictures available</Typography>
        )}
      </Grid>
    </Container>
  );
}

export default EventPictures;
