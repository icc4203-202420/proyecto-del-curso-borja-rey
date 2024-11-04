import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native'; // Importar TouchableOpacity
import { IP_BACKEND } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';

const LoginSchema = yup.object({
  email: yup.string().email('Invalid email').required('The email is necessary to login'),
  password: yup.string().min(6, 'Too Short!').required('Please enter your password'),
});

const Login = () => {
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState('');
  const { setCurrentUser } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={(values, { setSubmitting }) => {
          fetch(`http://${IP_BACKEND}:3001/api/v1/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: values }),
          })
            .then(response => response.json())
            .then(data => {
              AsyncStorage.setItem('current_user', JSON.stringify(data.status.data.user));
              setCurrentUser(data.status.data.user);
              console.log("data: ", data.headers);
              setSubmitting(false);
              navigation.navigate('Home'); // Redirige al Main (BottomTabs) en caso de éxito
            })
            .catch(error => {
              setErrorMessage('Invalid email or password.');
              setSubmitting(false);
            });
        }}
      >
        {({ errors, touched, isSubmitting, handleSubmit }) => (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>
            <View style={styles.inputContainer}>
              <Field
                name="email"
                component={CustomInput}
                placeholder="Email"
                keyboardType="email-address"
                error={touched.email && errors.email}
              />
            </View>
            <View style={styles.inputContainer}>
              <Field
                name="password"
                component={CustomInput}
                placeholder="Password"
                secureTextEntry
                error={touched.password && errors.password}
              />
            </View>
            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

const CustomInput = ({ field, form, ...props }) => {
  return (
    <View>
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
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F4E1', // Usar el mismo color de fondo que BeersScreen
  },
  formContainer: {
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
    fontFamily: "Belwe",
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
    backgroundColor: '#AF8F6F', // Usar el mismo color que el botón de búsqueda en BeersScreen
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: "Belwe",
  },
});

export default Login;