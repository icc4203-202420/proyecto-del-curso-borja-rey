import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';
import { createConsumer } from '@rails/actioncable';

const FeedScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFeedItems();

    const cableConnection = createConsumer("ws://localhost:3001/cable");
    const channel = cableConnection.subscriptions.create(
      { channel: 'FeedChannel' },
      {
        received(data) {
          const newFeedItem = data.event_picture || data.review;
          if (newFeedItem) {
            setFeedItems((prevFeedItems) => [newFeedItem, ...prevFeedItems]);
          }
        },
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Fetch initial feed items from the server
  const fetchFeedItems = async () => {
    try {
      const response = await axiosInstance.get('feed', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'User-ID': currentUser.id,
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
      const barAddress = item.bar_address
        ? `${item.bar_address.line1 || ''}, ${item.bar_address.line2 || ''}, ${item.bar_address.city || ''}`
        : 'Address not available';
      return (
        <TouchableOpacity onPress={() => navigation.navigate('BarShow', { id: item.bar_id })}>
          <View style={styles.postContainer}>
            <Text style={styles.description}>
              {item.user_handle} rated {item.beer_name} {item.rating} stars
            </Text>
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
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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