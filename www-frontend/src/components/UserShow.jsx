import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, useTheme, useMediaQuery, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import './BarShow.css';

const EventSchema = yup.object({
    event: yup.number(),
});

function UserShow() {
    const { id } = useParams();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [isFriend, setIsFriend] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(0);
    const current_user = JSON.parse(localStorage.getItem('current_user'));

    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchEvents = async () => {
          try {
            const response = await fetch(`http://localhost:3001/api/v1/events`);
            const data = await response.json();
            console.log('Events:', data);
            setEvents(data.events);
          } catch (error) {
            console.error('Error fetching Events:', error);
          }
        };

        const fetchIsFriend = async () => {
            const current_user = JSON.parse(localStorage.getItem('current_user'));
            const isFriendValues = {
                user_id: current_user.id,
                friend_id: id,
            };
            console.log('Is friend values:', isFriendValues);
            try {
                const response = await axios.post(`http://localhost:3001/api/v1/users/${id}/is_friend`, { friendship: isFriendValues });
                const data = response.data;
                console.log('Is friend:', data);
                console.log('Is friend:', data.is_friend);
                setIsFriend(data.is_friend);
            } catch (error) {
                console.error('Error fetching is friend:', error);
            }
        };
    
        fetchIsFriend();
        fetchEvents();
      }, []); // Ensure the effect runs only once

    const handleNewFriend = (id) => {
        const current_user = JSON.parse(localStorage.getItem('current_user'));
        const userId = current_user.id;
        const friendshipValues = {
            user_id: userId,
            friend_id: id,
            event_id: selectedEvent,
        };
        console.log('Friendship values:', friendshipValues);
        axios.post(`http://localhost:3001/api/v1/users/${id}/friendships`, { friendship: friendshipValues })
            .then(response => {
                console.log('Friendship created successfully:', response.data);
            })
            .catch(error => {
                console.error('Error creating friendship:', error);
            });
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/v1/users/${id}`);
                const data = await response.json();
                setUser(data);
                console.log('User:', data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
        setLoading(false);
    }, [id]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
      }
    
      if (!user) {
        return <Typography variant="h6">User not found.</Typography>;
      }

    return (
        current_user ? (
            <Container maxWidth={false} disableGutters sx={{ width: "100%", display: 'flex', flexDirection: 'column' , fontFamily: 'Belwe', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
                <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 3, paddingRight: 3 }}>
                    <Box sx={{ padding: 1 }}>
                        <Typography variant="h5" sx={{ fontFamily: 'Belwe' }}>
                            {user.handle}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            {user.first_name} {user.last_name}, {user.age || 'N/A'} years old 
                        </Typography>
                    </Box>
                    <Box sx={{padding: 0 }}>
                        <Typography variant="body2" color="textSecondary">
                            {user.email || 'N/A'}
                        </Typography>
                    </Box>
                    <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "5px" }}>
                    {!isFriend ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <FormControl fullWidth>
                            <InputLabel id="event-label">Event</InputLabel>
                            <Select
                                labelId="event-label"
                                label="(Optional)"
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                            >
                                {events
                                    .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente
                                    .map((event) => (
                                        <MenuItem key={event.id} value={event.id}> {/* Guardar el id */}
                                            {event.name} {/* Mostrar el nombre */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button variant="contained" class="buttonAdd" onClick={() => handleNewFriend(user.id)}>
                                Add Friend
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" class="buttonIs">
                                You are already friends!!!
                            </Button>
                        </Box>
                    )}
                    </Box>
                    <Box sx={{ padding: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: "5px" }}>
                        <Button variant="contained" class="buttonView" onClick={() => navigate(`/users`)}>
                            Back
                        </Button>
                    </Box>
                </Paper>
            </Container>
            ) : (
            <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
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

export default UserShow;