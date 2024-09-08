import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { TextField, Button, Box, Container, Paper, Typography, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import './Sessions.css';

const SignupSchema = yup.object({
  first_name: yup.string().required('The first name is necessary to signup'),
  last_name: yup.string().required('The last name is necessary to signup'),
  age: yup.number(),
  email: yup.string().email('Invalid email').required('The email is necessary to signup'),
  handle: yup.string().required('The handle is necessary to signup (e.g. kingofbeers)'),
  password: yup.string().min(6, 'Too Short!').required('Please enter your password'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Required'),

  line1: yup.string(),
  line2: yup.string(),
  city: yup.string(),
  country: yup.number(),
});

const Signup = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [countries, setCountries] = useState([]);

  // Fetch countries when the component is mounted
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/countries`);
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []); // Ensure the effect runs only once

  return (
    <Container className='container'>
      <Box mt={10}>
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            age: '',
            email: '',
            handle: '',
            password: '',
            password_confirmation: '',
            line1: '',
            line2: '',
            city: '',
            country: ''
          }}
          validationSchema={SignupSchema}
          onSubmit={(values, { setSubmitting }) => {
            const userValues = {
              first_name: values.first_name,
              last_name: values.last_name,
              age: values.age,
              email: values.email,
              handle: values.handle,
              password: values.password,
              password_confirmation: values.password_confirmation,
            };

            const addressValues = {
              line1: values.line1,
              line2: values.line2,
              city: values.city,
            };

            const countryId = values.country;

            axios.post('http://localhost:3001/api/v1/signup', { user: userValues })
              .then(response => {
                console.log('Signed up successfully:', response.data);
                console.log("Nuevo usuario creado con id:", response.data.data.id);
                const userId = response.data.data.id;

                if (addressValues.line1 || addressValues.line2 || addressValues.city || countryId) {
                  axios.post('http://localhost:3001/api/v1/addresses', { address: { ...addressValues, country_id: countryId, user_id: userId } })
                    .then(addressResponse => {
                      console.log('Address created successfully:', addressResponse.data);
                      localStorage.setItem('current_user', JSON.stringify(response.data.data));
                      setSubmitting(false);
                      navigate('/'); // Redirect on success
                    })
                    .catch(addressError => {
                      console.error('Error creating address:', addressError);
                      setErrorMessage('Error al crear la dirección. Por favor, inténtalo de nuevo.');
                      setSubmitting(false);
                    });
                } else {
                  console.log("response.data.status.data.user: ", response.data.data);
                  localStorage.setItem('current_user', JSON.stringify(response.data.data));
                  setSubmitting(false);
                  navigate('/'); // Redirect on success
                }
              })
              .catch(error => {
                if (error.response.status === 422) {
                  setErrorMessage('Ya existe un usuario con esos datos');
                } else {
                  console.error('Error signing up:', error);
                  setErrorMessage('Error al registrarse. Por favor, inténtalo de nuevo.');
                }
                setSubmitting(false);
              });
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Paper elevation={4} sx={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: 3 }} className="paper-session">
              <Typography variant="h4" gutterBottom className='title'>
                Signup
              </Typography>
              <Form>
                <Grid container spacing={2}>
                  {/* Columna izquierda: Datos del usuario */}
                  <Grid item xs={12} md={6}>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="first_name"
                        as={TextField}
                        label="First Name *"
                        fullWidth
                        error={touched.first_name && !!errors.first_name}
                        helperText={touched.first_name && errors.first_name}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="last_name"
                        as={TextField}
                        label="Last Name *"
                        fullWidth
                        error={touched.last_name && !!errors.last_name}
                        helperText={touched.last_name && errors.last_name}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="age"
                        as={TextField}
                        label="Age"
                        fullWidth
                        error={touched.age && !!errors.age}
                        helperText={touched.age && errors.age}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="email"
                        as={TextField}
                        label="Email *"
                        fullWidth
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="handle"
                        as={TextField}
                        label="Handle *"
                        fullWidth
                        error={touched.handle && !!errors.handle}
                        helperText={touched.handle && errors.handle}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="password"
                        as={TextField}
                        label="Password *"
                        type="password"
                        fullWidth
                        error={touched.password && !!errors.password}
                        helperText={touched.password && errors.password}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="password_confirmation"
                        as={TextField}
                        label="Password Confirmation *"
                        type="password"
                        fullWidth
                        error={touched.password_confirmation && !!errors.password_confirmation}
                        helperText={touched.password_confirmation && errors.password_confirmation}
                      />
                    </Box>
                  </Grid>

                  {/* Columna derecha: Dirección */}
                  <Grid item xs={12} md={6}>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="line1"
                        as={TextField}
                        label="Address Line 1"
                        fullWidth
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="line2"
                        as={TextField}
                        label="Address Line 2"
                        fullWidth
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        className='input'
                        name="city"
                        as={TextField}
                        label="City"
                        fullWidth
                      />
                    </Box>
                    <Box mb={2}>
                    <Field name="country">
                      {({ field, form }) => (
                        <FormControl fullWidth>
                          <InputLabel id="country-label">Country</InputLabel>
                          <Select
                            labelId="country-label"
                            label="Country"
                            {...field}
                            onChange={(event) => form.setFieldValue(field.name, event.target.value)}
                            value={field.value || ''}
                          >
                            {countries
                              .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente
                              .map((country) => (
                                <MenuItem key={country.id} value={country.id}> {/* Guardar el id */}
                                  {country.name} {/* Mostrar el nombre */}
                                </MenuItem>
                              ))}
                          </Select>
                          {form.touched.country && form.errors.country && (
                            <Typography color="error" variant="caption">
                              {form.errors.country}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    </Field>
                    </Box>
                    {errorMessage && <Typography color="error" className='error-message'>{errorMessage}</Typography>}
                    <Button type="submit" variant="contained" color="primary" className="submit-button" disabled={isSubmitting} sx={{ alignItems: 'center' }}>
                      Submit
                    </Button>
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

export default Signup;
