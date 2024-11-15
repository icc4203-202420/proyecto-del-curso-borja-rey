import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { IP_BACKEND } from '@env';
import { createConsumer } from '@rails/actioncable';

const FeedScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFeedItems();

    // Initialize Action Cable consumer for real-time updates
    const cable = createConsumer(`ws://${IP_BACKEND}:3001/cable`);
    const channel = cable.subscriptions.create('FeedChannel', {
      received(data) {
        // Handle new data from the WebSocket channel
        const newFeedItem = data.event_picture || data.review;
        if (newFeedItem) {
          setFeedItems((prevFeedItems) => [newFeedItem, ...prevFeedItems]);
        }
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Fetch initial feed items from the server
  const fetchFeedItems = async () => {
    try {
      const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/feed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`, // Assuming you have a token for authentication
          'User-ID': currentUser.id, // Send the user ID in the header
        },
      });
      const data = await response.json();
      setFeedItems(data);
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
      const barAddress = item.bar_address ? `${item.bar_address.line1 || ''}, ${item.bar_address.line2 || ''}, ${item.bar_address.city || ''}` : 'Address not available';
      return (
        <TouchableOpacity onPress={() => navigation.navigate('BarShow', { id: item.bar_id })}>
          <View style={styles.postContainer}>
            <Text style={styles.description}>{item.user_handle} rated {item.beer_name} {item.rating} stars</Text>
            <Text style={styles.description}>Global rating: {item.global_rating}</Text>
            <Text style={styles.description}>Reviewed at: {item.created_at}</Text>
            <Text style={styles.description}>Bar: {item.bar_name}</Text>
            <Text style={styles.description}>Country: {item.bar_country}</Text>
            <Text style={styles.description}>Address: {barAddress}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <FlatList
      data={feedItems}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F4E1',
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
    fontFamily: 'Belwe',
  },
  user: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Belwe',
  },
});

export default FeedScreen;
