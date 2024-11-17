import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';

const FeedScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFeedItems();

    // Initialize WebSocket connection
    const ws = new WebSocket('wss://30e7-191-113-128-201.ngrok-free.app/cable'); // Reemplaza con tu URL de ngrok

    ws.onopen = () => {
      console.log('WebSocket connection opened');
      ws.send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({ channel: 'FeedChannel' }), // Asegúrate de que el canal esté configurado correctamente en el servidor
        })
      );
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const message = response.message;
      if (message) {
        setFeedItems((prevFeedItems) => [message, ...prevFeedItems]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Fetch initial feed items from the server
  const fetchFeedItems = async () => {
    try {
      const response = await axiosInstance.get('feed', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`, // Assuming you have a token for authentication
          'User-ID': currentUser.id, // Send the user ID in the header
        },
      });
      setFeedItems(response.data);
    } catch (error) {
      console.error('Error fetching feed items:', error);
    }
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
      return (
        <TouchableOpacity onPress={() => navigation.navigate('BarShow', { id: item.bar_id })}>
          <View style={styles.postContainer}>
            <Text style={styles.description}>{item.user_handle} rated {item.beer_name} {item.rating} stars</Text>
            <Text style={styles.description}>Global rating: {item.global_rating}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `key-${index}`)}
        contentContainerStyle={styles.flatListContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
});

export default FeedScreen;