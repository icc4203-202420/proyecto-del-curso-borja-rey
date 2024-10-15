import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BeerLogo from '../../assets/beerLogo.png';

export default function BarsScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSearchBar = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/bars');
      const data = await response.json();
      const filteredBars = data.bars.filter(bar => 
        bar.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBars(filteredBars);
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearchBar();  // Hacer la primera llamada para obtener los bares
  }, []);

  const handleViewClick = (id) => {
    navigation.navigate('BarDetails', { id });  // Navegar a la pantalla de detalles de un bar
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bars</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchBar}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : bars.length === 0 ? (
        <Text>No bars found.</Text>
      ) : (
        <FlatList
          data={bars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.barName}>{item.name}</Text>
              <Text style={styles.barAddress}>
                {item.address?.line1 || 'N/A'}, {item.address?.line2 || 'N/A'}
              </Text>
              <Text style={styles.barCity}>
                {item.address?.city || 'N/A'}, {item.address?.country?.name || 'N/A'}
              </Text>
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
    backgroundColor: '#d7b49e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 3,
  },
  barName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  barAddress: {
    fontSize: 14,
    color: '#555',
  },
  barCity: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#d7b49e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
