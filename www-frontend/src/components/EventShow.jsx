import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BarShow.css';

function EventShow() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const current_user = JSON.parse(localStorage.getItem('current_user'));

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleViewBarClick = (id) => {
    navigate(`/bars/${id}`);
  };

  const handleViewPicturesClick = (id) => {
    navigate(`/events/${id}/pictures`);
  };

  const handlePostPictureClick = (id) => {
    localStorage.setItem("event", id);
    navigate(`/events/${id}/picture`);
  };

  const fetchAttendances = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/events/${id}/attendances`);
      const data = await response.json();
      setAttendances(data.attendances || []);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  };

  const handleCheckinEvent = (id) => {
    const current_user = JSON.parse(localStorage.getItem('current_user'));
    const userId = current_user.id;
    const attendanceValues = {
      user_id: userId,
      event_id: id,
      checked_in: true
    };
    axios.post('http://localhost:3001/api/v1/attendances', { attendance: attendanceValues })
      .then(response => {
        console.log('Attendance created successfully:', response.data);
        fetchAttendances();  // Actualizar las asistencias sin recargar la página
      })
      .catch(error => {
        console.error('Error creating attendance:', error);
      });
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/events/${id}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
    fetchAttendances();  // Inicializar con las asistencias cargadas
    setLoading(false);
  }, [id]);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (!event) {
    return <Typography variant="h6">Event not found.</Typography>;
  }

  return (
    current_user ? (
      <Container maxWidth={false} disableGutters sx={{ height: '100vh', width: isSmallScreen ? '100%' : '100vh', width: isMediumScreen ? "100%" : "100vh", display: 'flex', flexDirection: 'column' , fontFamily: 'Belwe', marginTop: isSmallScreen ? '30%' : '0' }}>
        <Container maxWidth={false} disableGutters sx={{ width: isSmallScreen || isMediumScreen ? '100%' : '85%', marginBottom: '10px' }}>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ padding: 1 }}>
              <Typography variant="h5" sx={{ fontFamily: 'Belwe' }}>
                {event.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Description: {event.description || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <img
                src={event.image_url || "https://via.placeholder.com/400"}
                alt={event.name}
                style={{ width: '100%', height: 'auto', maxHeight: '40vh', objectFit: 'cover' }}
              />
            </Box>
            <Box sx={{ padding: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Date: {new Date(event.date).toLocaleDateString()} | Starts at: {new Date(event.start_date).toLocaleTimeString()} | Ends at: {new Date(event.end_date).toLocaleTimeString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Bar: {event.bar_name}
              </Typography>
            </Box>
            <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'right' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Button className="button-custom" 
                  sx={{ 
                    backgroundColor: '#AF8F6F', 
                    fontFamily: 'Belwe', 
                    textTransform: 'none',
                    color: 'white',
                    mr: 1,
                    '&:hover': { 
                      backgroundColor: '#8f7558'
                    } 
                  }}  
                  onClick={() => handleCheckinEvent(event.id)}
                >
                  Check-in
                </Button>
                <Button className="button-custom" sx={{ 
                  backgroundColor: '#AF8F6F', 
                  fontFamily: 'Belwe', 
                  textTransform: 'none',
                  ml: 1,
                  mr: 1,
                  color: 'white', 
                  '&:hover': { 
                    backgroundColor: '#8f7558'
                  } 
                }} onClick={() => handleViewBarClick(event.bar_id)}>
                  View Bar
                </Button>
                <Button className="button-custom" 
                  sx={{ 
                    backgroundColor: '#AF8F6F', 
                    fontFamily: 'Belwe', 
                    textTransform: 'none',
                    color: 'white',
                    ml: 1,
                    mr: 1,
                    '&:hover': { 
                      backgroundColor: '#8f7558'
                    } 
                  }}  
                  onClick={() => handleViewPicturesClick(id)}
                >
                  Picture Gallery
                </Button>
                <Button className="button-custom" sx={{ 
                  backgroundColor: '#AF8F6F', 
                  fontFamily: 'Belwe', 
                  textTransform: 'none',
                  ml: 1,
                  mr: 1,
                  color: 'white', 
                  '&:hover': { 
                    backgroundColor: '#8f7558'
                  } 
                }} onClick={() => handlePostPictureClick(id)}>
                  Post Picture
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
        
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
            <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Attendance</Typography>
              {attendances.length > 0 ? (
                attendances.map(attendance => (
                  <Box key={attendance.id} sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
                    <Box>
                      <Typography variant="body1">{attendance.user.name} | {attendance.user.first_name} {attendance.user.last_name}</Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ padding: 1 }}>No Attendance found.</Typography>
              )}
            </Box>
          </Paper>
        </Container>
        <Typography sx={{ padding: 1 }}></Typography>
      </Container>
    ) : (
      <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: isSmallScreen || isMediumScreen ? '30%' : '0' }}>
        <div className="imageContainer">
          <img
            src={BeerLogo}
            alt="Beer Logo"
          />
        </div>
        <Box className="boxTodo">
          <Typography variant="h3" sx={{ fontFamily: "Belwe", color: "#000000", padding: "20px", marginTop: "50px" }}>
            Error 401
          </Typography>
        </Box>
      </Container>
    )
  );
}

export default EventShow;
