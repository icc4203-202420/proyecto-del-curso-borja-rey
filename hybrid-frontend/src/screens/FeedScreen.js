import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';

const FeedScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [filteredFeedItems, setFilteredFeedItems] = useState([]);
  const [filter, setFilter] = useState(null);
  const [friends, setFriends] = useState([]);
  const [bars, setBars] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchBeer, setSearchBeer] = useState('');
  const [beerResults, setBeerResults] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('');
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    // Carga inicial de datos
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([fetchFeedItems(), fetchFriends(), fetchBars()]);
    fetchCountries();
  };

  const fetchFeedItems = async () => {
    try {
      const response = await axiosInstance.get('feed', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'User-ID': currentUser.id,
        },
      });
      setFeedItems(response.data);
      setFilteredFeedItems(response.data);
    } catch (error) {
      console.error('Error fetching feed items:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axiosInstance.get(`users/${currentUser.id}/friendships`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchBars = async () => {
    try {
      const response = await axiosInstance.get('bars', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      setBars(response.data.bars);
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  };

  const fetchCountries = () => {
    const uniqueCountries = [...new Set(feedItems.map(item => item.bar_country))].filter(Boolean);
    setCountries(uniqueCountries);
  };

  const searchBeerByName = async (query) => {
    try {
      if (query.trim() === '') {
        setBeerResults([]);
        return;
      }
      const response = await axiosInstance.get(`beers/search?name=${query}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      setBeerResults(response.data.beers);
    } catch (error) {
      console.error('Error searching beers:', error);
    }
  };

  const applyFilter = (type, value) => {
    setFilter({ type, value });
    const newFilteredItems = feedItems.filter(item => {
      if (type === 'friend' && item.user_handle === value) return true;
      if (type === 'bar' && item.bar_id === value) return true;
      if (type === 'country' && item.bar_country === value) return true;
      if (type === 'beer' && item.beer_name === value) return true;
      return false;
    });
    setFilteredFeedItems(newFilteredItems);
    setIsModalVisible(false);
    setSubModalVisible(false);
  };

  const clearFilter = () => {
    setFilter(null);
    setFilteredFeedItems(feedItems);
  };

  const renderItem = ({ item }) => {
    if (item.type === 'event_picture') {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('EventShow', { id: item.event_id })}>
          <View style={styles.postContainer}>
            <Image source={{ uri: item.picture_url }} style={styles.image} />
            <Text style={styles.description}>{item.description}</Text>
            {item.user_handle && <Text style={styles.user}>{item.user_handle}</Text>}
          </View>
        </TouchableOpacity>
      );
    } else if (item.type === 'review') {
      const address = item.bar_address && item.bar_address.line1
        ? `${item.bar_address.line1 || ''}, ${item.bar_address.line2 || ''}, ${item.bar_address.city || ''}`.trim()
        : 'N/A';
      return (
        <TouchableOpacity onPress={() => navigation.navigate('BarShow', { id: item.bar_id })}>
          <View style={styles.postContainer}>
            <Text style={styles.description}>Friend: {item.user_handle}</Text>
            <Text style={styles.description}>Beer: {item.beer_name}</Text>
            <Text style={styles.description}>User Rating: {item.rating} stars</Text>
            <Text style={styles.description}>Global Rating: {item.global_rating} stars</Text>
            <Text style={styles.description}>Reviewed at: {item.created_at}</Text>
            <Text style={styles.description}>Bar: {item.bar_name}</Text>
            <Text style={styles.description}>Country: {item.bar_country || 'N/A'}</Text>
            <Text style={styles.description}>Address: {address}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('BarShow', { id: item.bar_id })}
            >
              <Text style={styles.buttonText}>View Bar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };
  

  const openFilterModal = (type) => {
    setFilterType(type);
    setSubModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Botón para abrir el filtro */}
      <TouchableOpacity style={styles.filterButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredFeedItems}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id ? item.id.toString() : `key-${Math.random()}`)}
        contentContainerStyle={styles.flatListContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text>No feed items available</Text>
          </View>
        )}
      />

      {/* Modal principal para seleccionar tipo de filtro */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => openFilterModal('friend')}>
            <Text style={styles.modalOption}>Filter by Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openFilterModal('bar')}>
            <Text style={styles.modalOption}>Filter by Bar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openFilterModal('country')}>
            <Text style={styles.modalOption}>Filter by Country</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openFilterModal('beer')}>
            <Text style={styles.modalOption}>Search by Beer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearFilter}>
            <Text style={styles.modalOption}>Clear Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeModal}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Submodal para opciones específicas de filtro */}
      <Modal visible={subModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {filterType === 'friend' && friends.length > 0 && (
            friends.map((friend) => (
              <TouchableOpacity key={friend.id} onPress={() => applyFilter('friend', friend.handle)}>
                <Text style={styles.modalOption}>{friend.handle}</Text>
              </TouchableOpacity>
            ))
          )}
          {filterType === 'bar' && bars.length > 0 && (
            bars.map((bar) => (
              <TouchableOpacity key={bar.id} onPress={() => applyFilter('bar', bar.id)}>
                <Text style={styles.modalOption}>{bar.name}</Text>
              </TouchableOpacity>
            ))
          )}
          {filterType === 'country' && countries.length > 0 && (
            countries.map((country) => (
              <TouchableOpacity key={country} onPress={() => applyFilter('country', country)}>
                <Text style={styles.modalOption}>{country}</Text>
              </TouchableOpacity>
            ))
          )}
          {filterType === 'beer' && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Search for a beer"
                value={searchBeer}
                onChangeText={(text) => {
                  setSearchBeer(text);
                  searchBeerByName(text);
                }}
              />
              {beerResults.map((beer) => (
                <TouchableOpacity key={beer.id} onPress={() => applyFilter('beer', beer.name)}>
                  <Text style={styles.modalOption}>{beer.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity onPress={() => setSubModalVisible(false)}>
            <Text style={styles.closeModal}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F4E1',
  },
  flatListContainer: {
    flexGrow: 1,
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  user: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalOption: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  closeModal: {
    marginTop: 10,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: 200,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default FeedScreen;
