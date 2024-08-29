import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

function BarShow() {
  const { id } = useParams();
  const [bar, setBar] = useState();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Events</Typography>
          {events.length > 0 ? (
            events.map(event => (
              <Box key={event.id} sx={{ marginTop: 1 }}>
                <Typography variant="body1">{event.name}</Typography>
                <Typography variant="body2">{event.description}</Typography>
                <Typography variant="body2">{new Date(event.date).toLocaleDateString()}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No events found.</Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default BarShow;