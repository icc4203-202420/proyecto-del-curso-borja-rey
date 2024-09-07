import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { TextField, Button, Box, Container, Typography, Paper } from '@mui/material';
import './Sessions.css'; // Asegúrate de que esta línea esté presente y correcta

const LoginSchema = yup.object({
  email: yup.string().email('Invalid email').required('The email is necessary to login'),
  password: yup.string().min(6, 'Too Short!').required('Please enter your password'),
});

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Container className="container">
      <Box mt={10}>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={(values, { setSubmitting }) => {
            axios.post('http://localhost:3001/api/v1/login', { user: values })
              .then(response => {
                console.log('Logged in successfully:', response.data);
                localStorage.setItem('current_user', response.data.status.data.user);
                console.log('Current user:', response.data.status.data.user);
                setSubmitting(false);
                navigate('/'); // Redirige al home en caso de éxito
              })
              .catch(error => {
                console.error('Error logging in:', error);
                setErrorMessage('Invalid email or password.');
                setSubmitting(false);
              });
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Paper elevation={4} sx={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: 3 }} className="paper-session">
              <Typography variant="h4" gutterBottom className='title'>
                Login
              </Typography>
              <Form>
                <Box mb={2}>
                  <Field
                    className='input'
                    name="email"
                    as={TextField}
                    label="Email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    className='input'
                    name="password"
                    as={TextField}
                    label="Password"
                    type="password"
                    fullWidth
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                </Box>
                {errorMessage && <Typography color="error" className='error-message'>{errorMessage}</Typography>}
                <Button type="submit" variant="contained" color="primary" className="submit-button" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form>
            </Paper>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Login;