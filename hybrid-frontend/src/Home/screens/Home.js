import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BeerLogo from '../../../assets/beerLogo.png'; // Asegúrate de que la ruta a la imagen sea correcta

function Home() {
  const current_user = JSON.parse(localStorage.getItem('current_user'));
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

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
      {current_user ? (
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
    marginBottom: 16,
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
  },
});

export default Home;