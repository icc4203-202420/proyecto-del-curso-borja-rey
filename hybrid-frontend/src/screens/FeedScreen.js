import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';

const FeedScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [filteredFeedItems, setFilteredFeedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [beerResults, setBeerResults] = useState([]);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFeedItems();
  }, []);

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

  const searchBeerByName = async (query) => {
    try {
      if (query.trim() === '') {
        setBeerResults([]);
        setFilteredFeedItems(feedItems);
        return;
      }
      const response = await axiosInstance.get(`beers/search?name=${query}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      setBeerResults(response.data.beers);
      setFilteredFeedItems(
        feedItems.filter(item => item.beer_name?.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching beers:', error);
    }
  };

  const handleViewClick = (id) => {
    navigation.navigate('BarShow', { id });
  };

  const renderItem = ({ item }) => {
    
    if (item.type === 'event_picture') {
      return (
          <View style={styles.postContainer}>
        <Image source={{ uri: item.picture_url }} style={styles.image} />
        {item.user_handle && (
          <Text>
            <Text style={styles.boldText}>{item.user_handle}</Text>: {item.description}
          </Text>
        )}
        <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('EventShow', { id: item.event_id })}
          >
            <Text style={styles.viewButtonText}>View Bar</Text>
          </TouchableOpacity>
          </View>
      );
    } else if (item.type === 'review') {
      const address = item.bar_address && item.bar_address.line1
        ? `${item.bar_address.line1 || ''}, ${item.bar_address.line2 || ''}, ${item.bar_address.city || ''}`.trim()
        : 'N/A';
      return (
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeader}>
            <Text style={styles.userName}>{item.user_handle || 'Anonymous'}</Text>
          </View>
          <View style={styles.reviewContent}>
            {item.beer_name && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Beer:</Text> {item.beer_name}
              </Text>
            )}
            {item.rating && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>User Rating:</Text> {item.rating}⭐
              </Text>
            )}
            {item.global_rating && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Global Rating:</Text> {item.global_rating}⭐
              </Text>
            )}
            {item.created_at && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Reviewed at:</Text> {item.created_at}
              </Text>
            )}
            {item.bar_name !== 'N/A' && item.bar_name && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Bar:</Text> {item.bar_name}
              </Text>
            )}
            {item.bar_country !== 'N/A' && item.bar_country && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Country:</Text> {item.bar_country}
              </Text>
            )}
            {address && address !== 'N/A' && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Address:</Text> {address}
              </Text>
            )}
            {item.bar_id && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewClick(item.bar_id)}
              >
                <Text style={styles.viewButtonText}>View Bar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.filterButtonText}>Search</Text>
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

      {/* Modal for searching */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search for a beer..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchBeerByName(text);
            }}
          />
          <FlatList
            data={beerResults}
            keyExtractor={(beer) => beer.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setFilteredFeedItems(feedItems.filter(feed => feed.beer_name === item.name))}>
                <Text style={styles.modalOption}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
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
    backgroundColor: '#F0F0F5',
  },
  flatListContainer: {
    flexGrow: 1,
    padding: 10,
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  boldText: {
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  filterButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#AF8F6F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
  },
  modalOption: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  closeModal: {
    marginTop: 15,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default FeedScreen;
