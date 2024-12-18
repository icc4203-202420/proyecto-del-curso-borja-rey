import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BeerLogo from '../../assets/beerLogo.png';
import { IP_BACKEND } from '@env'; // Importar la variable de entorno
import axiosInstance from '../context/urlContext';

export default function Beers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Función para buscar cervezas
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('beers');
      const data = await response.data;
      const filteredBeers = data.beers.filter(beer => 
        beer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBeers(filteredBeers);
    } catch (error) {
      console.error('Error fetching beers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();  // Llamada inicial para cargar cervezas
  }, []);

  const handleViewClick = (id) => {
    navigation.navigate('BeerShow', { id });  // Navegar a la pantalla de detalles de la cerveza
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beers</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : beers.length === 0 ? (
        <Text>No beers found.</Text>
      ) : (
        <FlatList
          data={beers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.beerName}>{item.name}</Text>
              <Text style={styles.beerDetails}>
                {item.style} - {item.alcohol} - {item.ibu}
              </Text>
              <Text style={styles.beerDetails}>Malts: {item.malts} | Hop: {item.hop}</Text>
              <Text style={styles.beerDetails}>Yeast: {item.yeast}</Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewClick(item.id)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F4E1',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Belwe',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#AF8F6F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Belwe',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 3,
  },
  beerName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Belwe',
  },
  beerDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  beerIngredients: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#AF8F6F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Belwe',
  },
});
