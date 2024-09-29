import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Button, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BarShow.css';

const TagSchema = yup.object({
    user_id: yup.number().required('User is required'),
});

function ShowPicture() {
  const { id } = useParams();
  const [picture, setPicture] = useState({});
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const current_user = JSON.parse(localStorage.getItem('current_user'));
  const navigate = useNavigate();


  const handleViewProfileClick = (id) => {
    navigate(`/users/${id}`);
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/event_pictures/${id}`);
      const data = await response.json();
      setTags(data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    const fetchPicture = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/event_pictures/${id}`);
        const data = await response.json();
        console.log("Data: ", data);
        console.log('Picture: ', data.picture);
        setPicture(data.event_picture);
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching pictures:', error);
      }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/users`);
            const data = await response.json();
            console.log('Users:', data);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    fetchTags();
    fetchUsers();
    fetchPicture();
  }, [id]);

  return (
    current_user ? (
    <Container>
      <Typography variant="h4" sx={{ fontFamily: "Belwe" }}>
        Picture
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item key={picture.id}>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <img
                    src={picture.picture_url}
                    style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <Typography variant="body1" align="center" sx={{ fontFamily: "Belwe" }}>
                  {user.handle}: {picture.description}
                </Typography>
            </Paper>
        </Grid>
      </Grid>
      <Container maxWidth={false} disableGutters sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
            <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Tags</Typography>
                <Box>
                    <Formik
                        initialValues={{
                            user_id: ''
                        }}
                        validationSchema={TagSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            const tagValues = {
                                event_picture_id: picture.id,
                                tagged_user_id: values.user_id,
                                tagged_by_id: current_user.id
                            };

                            axios.post('http://localhost:3001/api/v1/tags', { tag: tagValues })
                                .then(response => {
                                    console.log('Tag created successfully:', response.data);
                                    setSubmitting(false);
                                    fetchTags(); // Actualizar la lista de etiquetas
                                })
                                .catch(error => {
                                    console.error('Error creating tag:', error);
                                    setSubmitting(false);
                                });
                        }}
                    >
                    {({ errors, touched, isSubmitting }) => (
                    <Form>
                        <Box mb={2} sx={{ minWidth: "400px", display: 'flex', alignItems: 'center' }}>
                            <Field name="user_id">
                                {({ field, form }) => (
                                    <FormControl fullWidth>
                                      <InputLabel id="user-label">Tag a user</InputLabel>
                                      <Select
                                        labelId="user-label"
                                        label="User"
                                        {...field}
                                        onChange={(event) => form.setFieldValue(field.name, event.target.value)}
                                        value={field.value || ''}
                                      >
                                        {users
                                            .filter(user => user.id !== current_user.id)
                                          .sort((a, b) => a.handle.localeCompare(b.handle)) // Ordenar alfabéticamente
                                          .map((user) => (
                                            <MenuItem key={user.id} value={user.id}> {/* Guardar el id */}
                                              {user.handle} {/* Mostrar el nombre */}
                                            </MenuItem>
                                          ))}
                                      </Select>
                                      {form.touched.user && form.errors.user && (
                                        <Typography color="error" variant="caption">
                                          {form.errors.user}
                                        </Typography>
                                      )}
                                    </FormControl>
                                  )}
                            </Field>
                            <Button 
                                type='submit'
                                disabled={isSubmitting}
                                sx={{ 
                                    backgroundColor: '#AF8F6F', 
                                    textTransform: 'none',
                                    fontFamily: 'Belwe', 
                                    color: 'white', 
                                    marginRight: 2,
                                    marginLeft: 2,
                                    '&:hover': { 
                                    backgroundColor: '#8f7558'  // Un color más oscuro en el hover
                                    } 
                                }} 
                                >
                                Tag
                            </Button>
                        </Box>
                    </Form>
                    )}
                    </Formik>
                </Box>
            {tags.length > 0 ? (
                tags.map(tag => (
                  <Box key={tag.id} sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
                    <Box sx={{ width: "100%", padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                            <span style={{ fontWeight: 'bold' }}>{tag.tagged_by.handle}</span>: {tag.tagged_user.handle}
                        </Typography>
                        <Button className="button-custom" sx={{ 
                            backgroundColor: '#AF8F6F', 
                            fontFamily: 'Belwe', 
                            color: 'white', 
                            '&:hover': { 
                            backgroundColor: '#8f7558'  // Un color más oscuro en el hover
                            } 
                        }} onClick={() => handleViewProfileClick(tag.tagged_user.id)}>
                        View
                        </Button>
                    </Box>
                  </Box>
                ))
            ) : (
            <Typography sx={{ padding: 1 }}>No Tags found.</Typography>
            )}
            </Box>
          </Paper>
        </Container>
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

export default ShowPicture;