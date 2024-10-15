import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState('');
  const [countries, setCountries] = useState([]);

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
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
                    AsyncStorage.setItem('current_user', JSON.stringify(response.data.data));
                    setSubmitting(false);
                    navigation.navigate('Home'); // Redirect on success
                  })
                  .catch(addressError => {
                    console.error('Error creating address:', addressError);
                    setErrorMessage('Error al crear la dirección. Por favor, inténtalo de nuevo.');
                    setSubmitting(false);
                  });
              } else {
                console.log("response.data.status.data.user: ", response.data.data);
                AsyncStorage.setItem('current_user', JSON.stringify(response.data.data));
                setSubmitting(false);
                navigation.navigate('Home'); // Redirect on success
              }
            })
            .catch(error => {
              if (error.response.status === 422) {
                setErrorMessage('There is already a user with this email or handle.');
              } else {
                console.error('Error signing up:', error);
                setErrorMessage('Error Signing up. Please try again.');
              }
              setSubmitting(false);
            });
        }}
      >
        {({ errors, touched, isSubmitting, handleSubmit }) => (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Signup</Text>
            <Field
              name="first_name"
              component={CustomInput}
              placeholder="First Name *"
              error={touched.first_name && errors.first_name}
            />
            <Field
              name="last_name"
              component={CustomInput}
              placeholder="Last Name *"
              error={touched.last_name && errors.last_name}
            />
            <Field
              name="age"
              component={CustomInput}
              placeholder="Age"
              error={touched.age && errors.age}
            />
            <Field
              name="email"
              component={CustomInput}
              placeholder="Email *"
              keyboardType="email-address"
              error={touched.email && errors.email}
            />
            <Field
              name="handle"
              component={CustomInput}
              placeholder="Handle *"
              error={touched.handle && errors.handle}
            />
            <Field
              name="password"
              component={CustomInput}
              placeholder="Password *"
              secureTextEntry
              error={touched.password && errors.password}
            />
            <Field
              name="password_confirmation"
              component={CustomInput}
              placeholder="Password Confirmation *"
              secureTextEntry
              error={touched.password_confirmation && errors.password_confirmation}
            />
            <Field
              name="line1"
              component={CustomInput}
              placeholder="Address Line 1"
            />
            <Field
              name="line2"
              component={CustomInput}
              placeholder="Address Line 2"
            />
            <Field
              name="city"
              component={CustomInput}
              placeholder="City"
            />
            <Field name="country">
              {({ field, form }) => (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={field.value}
                    onValueChange={(itemValue) => form.setFieldValue(field.name, itemValue)}
                  >
                    <Picker.Item label="Select Country" value="" />
                    {countries
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((country) => (
                        <Picker.Item key={country.id} label={country.name} value={country.id} />
                      ))}
                  </Picker>
                  {form.touched.country && form.errors.country && (
                    <Text style={styles.errorText}>{form.errors.country}</Text>
                  )}
                </View>
              )}
            </Field>
            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
            <Button onPress={handleSubmit} title="Submit" disabled={isSubmitting} />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const CustomInput = ({ field, form, ...props }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        onChangeText={form.handleChange(field.name)}
        onBlur={form.handleBlur(field.name)}
        value={form.values[field.name]}
        {...props}
      />
      {form.touched[field.name] && form.errors[field.name] && (
        <Text style={styles.errorText}>{form.errors[field.name]}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default Signup;