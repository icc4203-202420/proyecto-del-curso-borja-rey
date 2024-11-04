import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { IP_BACKEND } from '@env';
import { UserContext } from '../context/UserContext';

function EventPictures() {
  const route = useRoute();
  const { id } = route.params;
  const [pictures, setPictures] = useState([]);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  const handleViewPictureClick = (pictureId) => {
    navigation.navigate('PictureShow', { id: pictureId });
  };

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/events/${id}/event_pictures`);
        const data = await response.json();
        console.log('Pictures:', data.pictures);
        setPictures(data.pictures);
      } catch (error) {
        console.error('Error fetching pictures:', error);
      }
    };

    fetchPictures();
  }, [id]);

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Image
          source={require('../../assets/beerLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.errorText}>Error 401</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Event Pictures</Text>
      <View style={styles.picturesContainer}>
        {pictures.length > 0 ? (
          pictures.map((picture) => (
            <View key={picture.id} style={styles.pictureCard}>
              <Image
                source={{ uri: picture.picture_url }}
                style={styles.picture}
              />
              <Text style={styles.description}>{picture.description}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleViewPictureClick(picture.id)}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.message}>No pictures available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F4E1',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Belwe',
    marginBottom: 16,
  },
  picturesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pictureCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    elevation: 4,
  },
  picture: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Belwe',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Belwe',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Belwe',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
  },
  errorText: {
    fontSize: 32,
    fontFamily: 'Belwe',
    color: '#000',
  },
});

export default EventPictures;