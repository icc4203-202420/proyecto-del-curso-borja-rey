import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IP_BACKEND } from '@env'; // Importar la variable de entorno
import axiosInstance from '../context/urlContext';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();  // Para la navegación entre pantallas

  // Función para buscar usuarios
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('users');
      const data = await response.data;
      // Filtrar usuarios según el término de búsqueda
      const filteredUsers = data.filter(user => 
        user.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();  // Llamada inicial para cargar usuarios
  }, []);

  const handleViewClick = (id) => {
    navigation.navigate('UserShow', { id });  // Navegar a la pantalla de detalles del usuario
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
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
      ) : users.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.userName}>
                {item.first_name} {item.last_name} ({item.handle})
              </Text>
              <Text style={styles.userDetails}>
                Email: {item.email}
              </Text>
              <Text style={styles.userDetails}>
                Age: {item.age}
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
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Belwe',
  },
  userDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#AF8F6F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Belwe',
  },
});
