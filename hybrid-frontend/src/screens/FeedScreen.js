import React, { useState, useEffect, useContext, useReducer } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../context/urlContext';

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
  const [checkedInEvents, setCheckedInEvents] = useState([]);
  const { currentUser } = useContext(UserContext);

  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const { events, loading, error } = state;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await axiosInstance.get(`bars/${id}`);
        setBar(response.data.bar);
      } catch (error) {
        console.error('Error fetching bar:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get(`bars/${id}/events`);
        dispatch({ type: 'FETCH_EVENTS_SUCCESS', payload: { events: response.data.events || [] } });
      } catch (error) {
        dispatch({ type: 'FETCH_EVENTS_ERROR', payload: error });
        console.error('Error fetching events:', error);
      }
    };

    const fetchCheckedInEvents = async () => {
      try {
        const response = await axiosInstance.get(`users/${currentUser.id}/checked_in_events`);
        setCheckedInEvents(response.data.checked_in_events || []);
      } catch (error) {
        console.error('Error fetching checked-in events:', error);
      }
    };

    fetchBar();
    fetchEvents();
    fetchCheckedInEvents();
  }, [id, currentUser]);

  const handleCheckinEvent = async (eventId) => {
    const userId = currentUser.id;
    const attendanceValues = {
      user_id: userId,
      event_id: eventId,
      checked_in: true,
    };
    try {
      const response = await axiosInstance.post('attendances', { attendance: attendanceValues });
      console.log('Attendance created successfully:', response.data);
      setCheckedInEvents([...checkedInEvents, eventId]);
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const handleViewEventClick = (eventId) => {
    navigation.navigate('EventShow', { id: eventId });
  };

  const isFutureEvent = (eventDate) => {
    const currentDate = new Date();
    return new Date(eventDate) > currentDate;
  };

  const checkIfCheckedIn = async (eventId) => {
    try {
      const response = await axiosInstance.get(`attendances/checked_in`, {
        params: {
          user_id: currentUser.id,
          event_id: eventId,
        },
      });
      return response.data.checked_in;
    } catch (error) {
      console.error('Error checking if user is checked in:', error);
      return false;
    }
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
                  {isFutureEvent(event.date) && !checkedInEvents.includes(event.id) && (
                    <TouchableOpacity style={styles.button} onPress={() => handleCheckinEvent(event.id)}>
                      <Text style={styles.buttonText}>Check-in</Text>
                    </TouchableOpacity>
                  )}
                  {checkedInEvents.includes(event.id) && (
                    <TouchableOpacity style={styles.buttonCheckedIn}>
                      <Text style={styles.buttonText2}>Checked</Text>
                    </TouchableOpacity>
                  )}
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
  buttonCheckedIn: {
    backgroundColor: '#F8F4E1',
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
  buttonText2: {
    color: 'black',
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
    marginLeft: 8,
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