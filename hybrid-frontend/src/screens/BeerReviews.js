import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'; // Importar TouchableOpacity
import { useNavigation } from '@react-navigation/native';
import { Formik, Field } from 'formik';
import Slider from '@react-native-community/slider';
import { IP_BACKEND } from '@env';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const BeerReviews = () => {
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState('');
  const [beerId, setBeerId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const beer = await AsyncStorage.getItem("beer");
        const currentUser = await AsyncStorage.getItem('current_user');
        if (beer) setBeerId(parseInt(beer));
        if (currentUser) setUserId(JSON.parse(currentUser).id);
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={{
          text: '',
          rating: 1,
        }}
        validationSchema={ReviewSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const reviewValues = {
            text: values.text,
            rating: values.rating,
            user_id: userId,
            beer_id: beerId
          };
          try {
            const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/reviews`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ review: reviewValues }),
            });
            const data = await response.json();
            console.log('Review created successfully:', data);
            setSubmitting(false);
            await AsyncStorage.removeItem("beer");
            navigation.navigate('BeerShow', { id: beerId, refresh: true });
          } catch (error) {
            if (error.response && error.response.status === 422) {
              setErrorMessage('You already have a review for this beer.');
            } else {
              console.error('Error creating review:', error);
              setErrorMessage('Error creating review. Please try again.');
            }
            setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting, setFieldValue, handleSubmit, values }) => (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create a Review</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={0.5}
                onValueChange={(value) => setFieldValue('rating', value)}
                value={1}
              />
              <Text>Rating: {values.rating}</Text>
            </View>
            <Field
              name="text"
              component={CustomTextInput}
              placeholder="Review Text *"
              multiline
              numberOfLines={4}
              style={styles.textInput}
            />
            {touched.text && errors.text && <Text style={styles.errorText}>{errors.text}</Text>}
            <Button
              title="Submit Review"
              fontFamily="Belwe"
              onPress={handleSubmit}
              disabled={isSubmitting}
              color="#AF8F6F"
            />
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const CustomTextInput = ({ field, form, ...props }) => {
  return (
    <TextInput
      style={styles.textInput}
      onChangeText={form.handleChange(field.name)}
      onBlur={form.handleBlur(field.name)}
      value={form.values[field.name]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F4E1', // Usar el mismo color de fondo que BeersScreen
  },
  formContainer: {
    backgroundColor: '#fff', // Fondo blanco para el formulario
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Belwe',
    marginBottom: 8,
    textAlign: 'center',
  },
  sliderContainer: {
    marginVertical: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: '#d7b49e', // Usar el mismo color que el botón de búsqueda en BeersScreen
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BeerReviews;