import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

function BarShow() {
  const { id } = useParams();
  const [bar, setBar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/bars/${id}`);
        const data = await response.json();
        setBar(data);
      } catch (error) {
        console.error('Error fetching bar:', error);
      }
      setLoading(false);
    };

    fetchBar();
  }, [id]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!bar) {
    return <Typography>Bar not found.</Typography>;
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h4">{bar.name}</Typography>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Address</Typography>
          <Typography>{bar.address.line1 || 'N/A'}, {bar.address.line2 || 'N/A'}</Typography>
          <Typography>{bar.address.city || 'N/A'}, {bar.address.country ? bar.address.country.name : 'N/A'}</Typography>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Details</Typography>
          <Typography>Latitude: {bar.latitude}</Typography>
          <Typography>Longitude: {bar.longitude}</Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default BarShow;