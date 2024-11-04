import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { IP_BACKEND } from '@env';
import { UserContext } from '../context/UserContext';

const initialState = {
  events: [],
  loading: true,
  error: null,
};

function eventsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_EVENTS_SUCCESS':
      return {
        ...state,
        events: action.payload.events,
        loading: false,
      };
    case 'FETCH_EVENTS_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}

function BarShow() {
  const route = useRoute();
  const { id } = route.params;
  const [bar, setBar] = useState(null);
  const { currentUser } = useContext(UserContext);

  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const { events, loading, error } = state;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/bars/${id}`);
        const data = await response.json();
        setBar(data.bar);
      } catch (error) {
        console.error('Error fetching bar:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/bars/${id}/events`);
        const data = await response.json();
        dispatch({ type: 'FETCH_EVENTS_SUCCESS', payload: { events: data.events || [] } });
      } catch (error) {
        dispatch({ type: 'FETCH_EVENTS_ERROR', payload: error });
        console.error('Error fetching events:', error);
      }
    };

    fetchBar();
    fetchEvents();
  }, [id]);

  const handleCheckinEvent = async (eventId) => {
    const userId = currentUser.id;
    const attendanceValues = {
      user_id: userId,
      event_id: eventId,
      checked_in: true,
    };
    try {
      const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/attendances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendance: attendanceValues }),
      });
      const data = await response.json();
      console.log('Attendance created successfully:', data);
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const handleViewEventClick = (eventId) => {
    navigation.navigate('EventShow', { id: eventId });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#AF8F6F" />;
  }

  if (!bar) {
    return <Text style={styles.message}>Bar not found.</Text>;
  }

  return (
    currentUser ? (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>{bar.name}</Text>
            <Text style={styles.subtitle}>{bar.address.line1 || 'N/A'}, {bar.address.line2 || 'N/A'}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: bar.image_url || "https://via.placeholder.com/400" }}
              style={styles.image}
            />
          </View>
          <View style={styles.box}>
            <Text style={styles.description}>{bar.address.city || 'N/A'}, {bar.address.country ? bar.address.country.name : 'N/A'}</Text>
            <Text style={styles.description}>Lat: {bar.latitude || 'N/A'}, Long: {bar.longitude || 'N/A'}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => console.log('Go clicked')}>
              <Text style={styles.buttonText}>Go</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => console.log('New Event clicked')}>
              <Text style={styles.buttonText}>New Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => console.log('Favorite clicked')}>
              <Text style={styles.buttonText}>Favorite</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>Events</Text>
            {events.length > 0 ? (
              events.map(event => (
                <View key={event.id} style={styles.eventBox}>
                  <View>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={() => handleCheckinEvent(event.id)}>
                    <Text style={styles.buttonText}>Check-in</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleViewEventClick(event.id)}>
                    <Text style={styles.buttonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No events found.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    ) : (
      <View style={styles.errorContainer}>
        <Image
          source={require('../../assets/beerLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.errorText}>Error 401</Text>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F4E1',
    flexGrow: 1,
  },
  paper: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  box: {
    padding: 8,
    marginBottom: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Belwe',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Belwe',
  },
  eventBox: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
  },
  errorText: {
    fontSize: 32,
    fontFamily: 'Belwe',
    color: '#000',
  },
});

export default BarShow;