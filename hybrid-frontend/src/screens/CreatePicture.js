import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';

// Validación del formulario usando Yup
const EventPictureSchema = yup.object({
  description: yup.string().required('Description is required'),
  image: yup.mixed().required('Image is required')
});

const CreatePicture = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUri, setPreviewUri] = useState(null);
  const { currentUser } = useContext(UserContext);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await fetch(values.image);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Obtener solo la parte base64

        const eventPictureValues = {
          description: values.description,
          user_id: currentUser.id,
          event_id: eventId,
          image_base64: base64Image
        };

        try {
          const response = await axiosInstance.post('event_pictures', { event_picture: eventPictureValues });
          console.log('Event picture created successfully:', response.data);
          setSubmitting(false);
          navigation.navigate('EventPictures', { id: eventId });
        } catch (error) {
          if (error.response && error.response.status === 422) {
            setErrorMessage('You already have uploaded a picture for this event.');
          } else {
            console.error('Error creating event picture:', error);
            navigation.navigate('EventPictures', { id: eventId });
            setErrorMessage('Error creating event picture. Please try again.');
          }
          setSubmitting(false);
        }
      };
    } catch (error) {
      console.error('Error converting image to blob:', error);
      setErrorMessage('Error converting image to blob. Please try again.');
      setSubmitting(false);
    }
  };

  const openCamera = async (setFieldValue) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      setFieldValue('image', result.assets[0].uri);
      setPreviewUri(result.assets[0].uri);
    }
  };

  const chooseFromGallery = async (setFieldValue) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      setFieldValue('image', result.assets[0].uri);
      setPreviewUri(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={{
          event_id: '',
          description: '',
          image: null
        }}
        validationSchema={EventPictureSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
          <View style={styles.form}>
            <Text style={styles.title}>Upload Event Picture</Text>
            <TextInput
              style={styles.input}
              placeholder="Description *"
              placeholderTextColor="rgba(0, 0, 0, 0.6)" // Cambia la opacidad del texto del placeholder
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              value={values.description}
            />
            {touched.description && errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => openCamera(setFieldValue)}
            >
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => chooseFromGallery(setFieldValue)}
            >
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
              />
            )}

            {touched.image && errors.image && (
              <Text style={styles.errorText}>{errors.image}</Text>
            )}

            {isSubmitting ? (
              <ActivityIndicator size="large" color="#AF8F6F" />
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            )}

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F4E1',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Belwe',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    fontFamily: 'Belwe',
  },
  button: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Belwe',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Belwe',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
  },
});

export default CreatePicture;