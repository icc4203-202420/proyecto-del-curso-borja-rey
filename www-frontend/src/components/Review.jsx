import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import Slider from '@mui/material/Slider';
import * as yup from 'yup';
import axios from 'axios';
import { TextField, Button, Box, Container, Paper, Typography, Grid } from '@mui/material';
import './Sessions.css';

yup.addMethod(yup.string, 'minWords', function (min, message) {
  return this.test('minWords', message, function (value) {
    const { path, createError } = this;
    if (!value) return true; // Skip validation if the value is empty
    const wordCount = value.split(' ').filter(word => word.length > 0).length;
    return wordCount >= min || createError({ path, message });
  });
});
const ReviewSchema = yup.object({
  text: yup.string().minWords(15, 'The review must be at least 15 words').required('The review is necessary to submit a review'),
  rating: yup.number().required('The rating is necessary to submit a review'),
});

const Review = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const beerId = parseInt(localStorage.getItem("beer"));
  const current_user = JSON.parse(localStorage.getItem('current_user'));
  const userId = current_user.id;
  return (
    <Container className='container'>
      <Box mt={10}>
        <Formik
          initialValues={{
            text: '',
            rating: 1,
            user: '',
            beer: ''
          }}
          validationSchema={ReviewSchema}
          onSubmit={(values, { setSubmitting }) => {
            const reviewValues = {
                text: values.text,
                rating: values.rating,
                user_id: userId,
                beer_id: beerId
              };
            axios.post('http://localhost:3001/api/v1/reviews', { review: reviewValues })
              .then(response => {
                console.log('Review created successfully:', response.data);
                setSubmitting(false);
                localStorage.removeItem("beer");
                navigate('/beers/' + beerId);
              })
              .catch(error => {
                if (error.response.status === 422) {
                  setErrorMessage('You already have a review for this beer.');
                }
                else {
                  console.error('Error creating review:', error);
                  setErrorMessage('Error creating review. Please try again.');
              }
              setSubmitting(false);
              });
          }}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Paper elevation={4} sx={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: 3 }} className="paper-session">
            <Typography variant="h4" gutterBottom className='title'>
              Create a Review
            </Typography>
            <Form>
            <Grid container spacing={2} direction="column">
                  <Grid item>
                    <Slider
                      defaultValue={1} // Default slider value
                      onChange={(event, newValue) => {
                        setFieldValue('rating', newValue); // Directly update Formik's value
                      }}
                      aria-labelledby="rating-slider"
                      step={0.5}
                      min={1}
                      max={5}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item>
                    <Field
                      className='input'
                      name="text"
                      as={TextField}
                      label="Review Text *"
                      fullWidth
                      error={touched.text && !!errors.text}
                      helperText={touched.text && errors.text}
                    />
                  </Grid>
                  {/* Submit button */}
                  <Grid item>
                    <Button type="submit" variant="contained" sx={{ 
                        backgroundColor: '#AF8F6F', 
                        textTransform: 'none',
                        fontFamily: 'Belwe', 
                        textTransform: 'none',
                        color: 'white', 
                        '&:hover': { 
                          backgroundColor: '#8f7558'  // Un color más oscuro en el hover
                        } 
                      }} disabled={isSubmitting}>
                      Submit Review
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

export default Review;
