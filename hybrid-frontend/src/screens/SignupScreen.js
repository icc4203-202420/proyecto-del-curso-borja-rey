import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { IP_BACKEND } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';

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
  const { setCurrentUser } = useContext(UserContext);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/countries`);
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
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
            onSubmit={async (values, { setSubmitting }) => {
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

              try {
                const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/signup`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ user: userValues }),
                });

                const data = await response.json();
                const userId = data.data.id;

                if (addressValues.line1 || addressValues.line2 || addressValues.city || countryId) {
                  await fetch(`http://${IP_BACKEND}:3001/api/v1/addresses`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      address: { ...addressValues, country_id: countryId, user_id: userId },
                    }),
                  });
                }

                await AsyncStorage.setItem('current_user', JSON.stringify(data.data));
                setCurrentUser(data.status.data.user);
                setSubmitting(false);
                navigation.navigate('Home');
              } catch (error) {
                if (error.response && error.response.status === 422) {
                  setErrorMessage('There is already a user with this email or handle.');
                } else {
                  setErrorMessage('Error Signing up. Please try again.');
                }
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting, handleSubmit }) => (
              <View>
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
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F4E1', // Usar el mismo color de fondo que BeersScreen
  },
  formContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff', // Fondo blanco para el formulario
    padding: 20,
    borderRadius: 5,
    elevation: 3,
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

export default Signup;