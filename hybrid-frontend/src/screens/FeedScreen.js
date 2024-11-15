import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
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

    // Initialize Action Cable consumer
    const cable = createConsumer(`ws://${IP_BACKEND}:3001/cable`);
    const channel = cable.subscriptions.create('FeedChannel', {
      received(data) {
        if (data.event_picture) {
          setFeedItems((prevFeedItems) => [data.event_picture, ...prevFeedItems]);
        } else if (data.review) {
          setFeedItems((prevFeedItems) => [data.review, ...prevFeedItems]);
        }
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

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
    if (item.picture_url) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('EventShow', { id: item.event.id })}>
          <View style={styles.postContainer}>
            <Image source={{ uri: item.picture_url }} style={styles.image} />
            <Text style={styles.description}>{item.description}</Text>
            {item.user_handle && <Text style={styles.user}>{item.user_handle}</Text>}
          </View>
        </TouchableOpacity>
      );
    } else if (item.rating) {
      const barAddress = `${item.bar_address.line1}, ${item.bar_address.line2}, ${item.bar_address.city}, ${item.bar_address.country_id}`;
      return (
        <TouchableOpacity onPress={() => navigation.navigate('BarShow', { id: item.bar_id })}>
          <View style={styles.postContainer}>
            <Text style={styles.description}>{item.user_handle} rated {item.beer_name} {item.rating} stars</Text>
            <Text style={styles.description}>Global rating: {item.global_rating}</Text>
            <Text style={styles.description}>Reviewed at: {item.created_at}</Text>
            <Text style={styles.description}>Bar: {item.bar_name}</Text>
            <Text style={styles.description}>Country: {item.bar_country}</Text>
            <Text style={styles.description}>Address: {barAddress}</Text>
            <Button title="View Bar" onPress={() => navigation.navigate('BarShow', { id: item.bar_id })} />
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
    padding: 16,
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
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