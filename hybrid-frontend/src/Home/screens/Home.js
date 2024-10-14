import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BeerLogo from '../../../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
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

    fetchCurrentUser();
  }, []);

  const handleSearch = () => {
    // Lógica de búsqueda aquí
    console.log('Buscando:', searchQuery);
  };

  const handleLogin = () => {
    // navigation.navigate('Login');
  };

  const handleSignup = () => {
    // navigation.navigate('Signup');
  };

  const handleOpenMap = () => {
    // navigation.navigate('Map');
  };

  return (
    <View style={styles.container}>
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
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
            <Text style={styles.buttonText}>Open Map</Text>
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
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(175, 143, 111, 0.85)',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    width: '100%',
    maxWidth: 336,
  },
  logo: {
    width: '100%',
    height: 'auto',
  },
  title: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -0.5 * width }, { translateY: -0.5 * width }],
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontSize: 85,
    fontWeight: 'bold',
    fontFamily: 'Belwe',
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  mapButton: {
    backgroundColor: '#74512D',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 50,
  },
  loginButton: {
    backgroundColor: '#F8F4E1',
    color: 'black',
    fontSize: 24,
    fontFamily: 'Belwe',
    fontWeight: '1000',
    lineHeight: 32,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#74512D',
    color: 'white',
    fontSize: 24,
    fontFamily: 'Belwe',
    fontWeight: '1000',
    lineHeight: 32,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Home;