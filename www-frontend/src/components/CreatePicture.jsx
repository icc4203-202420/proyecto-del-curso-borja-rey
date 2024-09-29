import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { TextField, Button, Box, Container, Paper, Typography, Grid } from '@mui/material';

// Validación del formulario usando Yup
const EventPictureSchema = yup.object({
  description: yup.string().required('Description is required'),
  image: yup.mixed().required('Image is required')
});

const CreatePictureForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (values, { setSubmitting }) => {
    const current_user = JSON.parse(localStorage.getItem('current_user'));
    const eventId = parseInt(localStorage.getItem("event"));
  
    const reader = new FileReader();
    reader.readAsDataURL(values.image);
    reader.onloadend = () => {
      const base64Image = reader.result.split(',')[1]; // Obtener solo la parte base64
  
      const eventPictureValues = {
        description: values.description,
        user_id: current_user.id,
        event_id: eventId,
        image_base64: base64Image
      };
  
      axios.post('http://localhost:3001/api/v1/event_pictures', { event_picture: eventPictureValues })
        .then(response => {
          console.log('Event picture created successfully:', response.data);
          setSubmitting(false);
          navigate('/events/' + eventId + '/pictures');
        })
        .catch(error => {
          if (error.response && error.response.status === 422) {
            setErrorMessage('You already have uploaded a picture for this event.');
          } else {
            console.error('Error creating event picture:', error);
            setErrorMessage('Error creating event picture. Please try again.');
          }
          setSubmitting(false);
        });
    };
  };

  return (
    <Container className="container">
      <Box mt={10}>
        <Formik
          initialValues={{
            event_id: '',  // Cambia esto si necesitas un valor predeterminado
            description: '',
            image: null
          }}
          validationSchema={EventPictureSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Paper elevation={4} sx={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: 3 }} className="paper-session">
              <Typography variant="h4" gutterBottom className="title">
                Upload Event Picture
              </Typography>
              <Form encType="multipart/form-data">
                <Grid container spacing={2} direction="column">

                  {/* Campo para la descripción */}
                  <Grid item>
                    <Field
                      name="description"
                      as={TextField}
                      label="Description *"
                      fullWidth
                      error={touched.description && !!errors.description}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>

                  {/* Campo para subir la imagen */}
                  <Grid item>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        setFieldValue("image", event.currentTarget.files[0]);
                      }}
                    />
                    {touched.image && errors.image && (
                      <Typography color="error">{errors.image}</Typography>
                    )}
                  </Grid>

                  {/* Botón de envío */}
                  <Grid item>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: '#AF8F6F',
                        textTransform: 'none',
                        fontFamily: 'Belwe',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#8f7558'  // Un color más oscuro en el hover
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                    {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                  </Grid>
                </Grid>
              </Form>
            </Paper>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default CreatePictureForm;
