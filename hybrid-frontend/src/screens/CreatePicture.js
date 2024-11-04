import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { IP_BACKEND } from '@env';
import { UserContext } from '../context/UserContext';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

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
      reader.onloadend = () => {
        const base64Image = reader.result.split(',')[1]; // Obtener solo la parte base64

        const eventPictureValues = {
          description: values.description,
          user_id: currentUser.id,
          event_id: eventId,
          image_base64: base64Image
        };

        fetch(`http://${IP_BACKEND}:3001/api/v1/event_pictures`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event_picture: eventPictureValues }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Event picture created successfully:', data);
            setSubmitting(false);
            navigation.navigate('EventPictures', { id: eventId });
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
    } catch (error) {
      console.error('Error converting image to blob:', error);
      setErrorMessage('Error converting image to blob. Please try again.');
      setSubmitting(false);
    }
  };

  const openCamera = (setFieldValue) => {
    launchCamera({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setFieldValue('image', response.assets[0].uri);
        setPreviewUri(response.assets[0].uri);
      }
    });
  };

  const chooseFromGallery = (setFieldValue) => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setFieldValue('image', response.assets[0].uri);
        setPreviewUri(response.assets[0].uri);
      }
    });
  };

  return (
    <View style={styles.container}>
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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