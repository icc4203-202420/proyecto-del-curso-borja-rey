import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';
import webSocketURL from '../context/webSocketURL';
import { createConsumer } from '@rails/actioncable';

const FeedScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [filteredFeedItems, setFilteredFeedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchFeedItems();
    }, [])
  );

  useEffect(() => {
    // Initialize Action Cable consumer for real-time updates
    console.log('Connecting to WebSocket:', webSocketURL);
    const cable = createConsumer(webSocketURL);
    const channel = cable.subscriptions.create('FeedChannel', {
      received(data) {
        // Handle new data from the WebSocket channel
        const newFeedItem = data;
        if (newFeedItem) {
          fetchFeedItems();
          console.log('New feed item');
          setFeedItems((prevFeedItems) => {
            const updatedFeedItems = [newFeedItem, ...prevFeedItems];
            setFilteredFeedItems(updatedFeedItems.filter(item => 
              item.beer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.bar_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.user_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.bar_name?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
            return updatedFeedItems;
          });
        }
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, [searchTerm]);

  const fetchFeedItems = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = feedItems.filter(item => 
      item.beer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bar_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bar_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeedItems(filtered);
  };

  const handleViewBarClick = (id) => {
    navigation.navigate('BarShow', { id });
  };

  const handleViewEventClick = (id) => {
    navigation.navigate('EventShow', { id });
  };

  const renderItem = ({ item }) => {
    if (item.type === 'event_picture') {
      console.log("tags: ", item.tags);
      return (
        <View style={styles.postContainer}>
          <Image source={{ uri: item.picture_url }} style={styles.image} />
          {item.user_handle && (
            <Text>
              <Text style={styles.boldText}>{item.user_handle}</Text>: {item.description}
            </Text>
          )}
          {item.event_name && (
            <Text>
              <Text style={styles.boldText}>Event</Text>: {item.event_name}
            </Text>
          )}

          {item.bar_name && (
            <Text>
              <Text style={styles.boldText}>Bar</Text>: {item.bar_name}
            </Text>
          )}
          {item.bar_country && (
            <Text>
              <Text style={styles.boldText}>Country</Text>: {item.bar_country}
            </Text>
          )}
          {item.created_at && (
            <Text>
              <Text style={styles.boldText}>Posted time</Text>: {item.created_at}
            </Text>
          )}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.boldText}>Tags:</Text>
              <View style={styles.tagsList}>
                {item.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>@{tag.tagged_user.handle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewEventClick(item.event_id)}
          >
            <Text style={styles.viewButtonText}>View Event</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'review') {
      console.log("add: ", item.bar_address);
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
            {item.bar_address && (
              <Text style={styles.reviewText}>
                <Text style={styles.boldText}>Address:</Text> {item.bar_address}
              </Text>
            )}
            {item.bar_id && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewBarClick(item.bar_id)}
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
      <Text style={styles.title}>Feed</Text>
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
      ) : filteredFeedItems.length === 0 ? (
        <Text>No feed items found.</Text>
      ) : (
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
      )}

      {/* Modal for searching */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search for a beer..."
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              handleSearch();
            }}
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
  tagsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  tagsList: {
    flexDirection: 'row', // Muestra los tags en línea
    flexWrap: 'wrap', // Permite que los tags salten de línea si es necesario
  },
  tag: {
    backgroundColor: '#EFEFEF', // Fondo gris claro
    borderRadius: 16, // Bordes redondeados
    paddingVertical: 4, // Espaciado interno en la parte superior/inferior
    paddingHorizontal: 12, // Espaciado interno en los laterales
    marginRight: 8, // Espaciado entre tags
    marginBottom: 8, // Espaciado vertical entre filas de tags
    alignSelf: 'flex-start', // Alineación para que cada tag se ajuste a su contenido
  },
  tagText: {
    fontSize: 14,
    color: '#555', // Color del texto del tag
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F4E1',
    padding: 20,
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
    backgroundColor: '#AF8F6F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
});

export default FeedScreen;