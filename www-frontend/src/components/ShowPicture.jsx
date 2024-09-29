import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';

function ShowPicture() {
  const { id } = useParams();
  const [picture, setPicture] = useState(null);

  useEffect(() => {
    const fetchPicture = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/events_picture/${id}`);
        const data = await response.json();
        console.log('Pictures:', data.picture);
        setPicture(data.picture);
      } catch (error) {
        console.error('Error fetching pictures:', error);
      }
    };

    fetchPicture();
  }, [id]);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Event Pictures
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item key={picture.id}>
            <Paper elevation={3} sx={{ padding: 2 }}>
            <img
                src={picture.picture_url}
                style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <Typography variant="body1" align="center" mt={1}>
            </Typography>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ShowPicture;
