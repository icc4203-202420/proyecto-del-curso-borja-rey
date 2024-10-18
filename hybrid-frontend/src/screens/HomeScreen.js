import React, { useState, useContext, useCallback } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BeerLogo from '../../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta
import { UserContext } from '../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient'; // Importa LinearGradient desde expo-linear-gradient

function Home({ navigation }) {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const user = await AsyncStorage.getItem('current_user');
      if (user !== null) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('current_user');
      setCurrentUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleOpenMap = () => {
    // navigation.navigate('Map');
  };

  return (
    <LinearGradient
      colors={['rgba(175, 143, 111, 250)', '#FFFFFF']}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={BeerLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Mistbeer</Text>
      </View>
      {currentUser ? (
        <>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
            <Text style={styles.buttonText}>Open Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    fontFamily: 'Belwe',
  },
  searchInput: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  mapButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Belwe',
  },
});

export default Home;