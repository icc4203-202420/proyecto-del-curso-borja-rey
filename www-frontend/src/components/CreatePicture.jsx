import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { TextField, Button, Box, Container, Paper, Typography, Grid } from '@mui/material';
import Webcam from 'react-webcam';

// Validación del formulario usando Yup
const EventPictureSchema = yup.object({
  description: yup.string().required('Description is required'),
  image: yup.mixed().required('Image is required')
});

const CreatePictureForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const webcamRef = useRef(null);

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

  const capturePhoto = useCallback((setFieldValue) => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        setFieldValue("image", blob);
        setCameraOpen(false);
      });
  }, [webcamRef]);

  return (
    <Container>
      <Box mt={10} sx={{ fontFamily: 'Belwe' }}> {/* Aplica la fuente a todo el formulario */}
        <Formik
          initialValues={{
            event_id: '',
            description: '',
            image: null
          }}
          validationSchema={EventPictureSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Paper elevation={8} sx={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Belwe' }}> {/* Aplica la fuente al título */}
                Upload Event Picture
              </Typography>
              <Form encType="multipart/form-data">
                <Grid container spacing={4} direction="column">
                  
                  {/* Campo para la descripción */}
                  <Grid item>
                    <Field
                      name="description"
                      as={TextField}
                      label="Description *"
                      fullWidth
                      error={touched.description && !!errors.description}
                      helperText={touched.description && errors.description}
                      sx={{ fontFamily: 'Belwe' }} 
                    />
                  </Grid>

                  {/* Campo para subir la imagen */}
                  <Grid item>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      capture="user" // Permite capturar una imagen desde la cámara en dispositivos móviles
                      onChange={(event) => {
                        setFieldValue("image", event.currentTarget.files[0]);
                      }}
                      style={{ fontFamily: 'Belwe' }}
                    />
                    {touched.image && errors.image && (
                      <Typography color="error" sx={{ fontFamily: 'Belwe' }}>{errors.image}</Typography>
                    )}
                  </Grid>

                  {/* Botón para abrir la cámara */}
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={() => setCameraOpen(true)}
                      sx={{
                        backgroundColor: '#AF8F6F',
                        textTransform: 'none',
                        color: 'white',
                        fontFamily: 'Belwe' // Aplica la fuente al botón
                      }}
                    >
                      Open Camera
                    </Button>
                  </Grid>

                  {/* Mostrar cámara si se ha abierto */}
                  {cameraOpen && (
                    <Grid item>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                      />
                      <Button
                        variant="contained"
                        onClick={() => capturePhoto(setFieldValue)}
                        sx={{
                          backgroundColor: '#AF8F6F',
                          textTransform: 'none',
                          color: 'white',
                          fontFamily: 'Belwe' // Aplica la fuente al botón
                        }}
                      >
                        Capture Photo
                      </Button>
                    </Grid>
                  )}

                  {/* Botón de enviar */}
                  <Grid item>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: '#AF8F6F',
                        textTransform: 'none',
                        color: 'white',
                        fontFamily: 'Belwe' // Aplica la fuente al botón
                      }}
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                    {errorMessage && <Typography color="error" sx={{ fontFamily: 'Belwe' }}>{errorMessage}</Typography>}
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
