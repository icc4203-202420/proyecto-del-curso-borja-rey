import React, { useState, useEffect, useContext, useReducer } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { IP_BACKEND } from '@env';
import { UserContext } from '../context/UserContext';

const initialState = {
  attendances: [],
  loading: true,
  error: null,
};

function attendancesReducer(state, action) {
  switch (action.type) {
    case 'FETCH_ATTENDANCES_SUCCESS':
      return {
        ...state,
        attendances: action.payload.attendances,
        loading: false,
      };
    case 'FETCH_ATTENDANCES_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}

function EventShow() {
  const route = useRoute();
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const { currentUser } = useContext(UserContext);

  const [state, dispatch] = useReducer(attendancesReducer, initialState);
  const { attendances, loading, error } = state;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/events/${id}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    const fetchAttendances = async () => {
      try {
        const response = await fetch(`http://${IP_BACKEND}:3001/api/v1/events/${id}/attendances`);
        const data = await response.json();
        dispatch({ type: 'FETCH_ATTENDANCES_SUCCESS', payload: { attendances: data.attendances || [] } });
      } catch (error) {
        dispatch({ type: 'FETCH_ATTENDANCES_ERROR', payload: error });
        console.error('Error fetching attendances:', error);
      }
    };

    fetchEvent();
    fetchAttendances();
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
      fetchAttendances(); // Refresh attendances
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const handleViewBarClick = (barId) => {
    navigation.navigate('BarDetails', { id: barId });
  };

  const handleViewPicturesClick = (eventId) => {
    navigation.navigate('EventPictures', { id: eventId });
  };

  const handlePostPictureClick = (eventId) => {
    navigation.navigate('CreatePicture', { id: eventId });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#AF8F6F" />;
  }

  if (!event) {
    return <Text style={styles.message}>Event not found.</Text>;
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
            <Text style={styles.title}>{event.name}</Text>
            <Text style={styles.subtitle}>Description: {event.description || 'N/A'}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.image_url || "https://via.placeholder.com/400" }}
              style={styles.image}
            />
          </View>
          <View style={styles.box}>
            <Text style={styles.description}>Date: {new Date(event.date).toLocaleDateString()} | Starts at: {new Date(event.start_date).toLocaleTimeString()} | Ends at: {new Date(event.end_date).toLocaleTimeString()}</Text>
            <Text style={styles.description}>Bar: {event.bar_name}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleCheckinEvent(event.id)}>
              <Text style={styles.buttonText}>Check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleViewBarClick(event.bar_id)}>
              <Text style={styles.buttonText}>View Bar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleViewPicturesClick(event.id)}>
              <Text style={styles.buttonText}>Picture Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handlePostPictureClick(event.id)}>
              <Text style={styles.buttonText}>Post Picture</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>Attendance</Text>
            {attendances.length > 0 ? (
              attendances.map(attendance => (
                <View key={attendance.id} style={styles.attendanceBox}>
                  <Text style={styles.attendanceText}>{attendance.user.name} | {attendance.user.first_name} {attendance.user.last_name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.message}>No Attendance found.</Text>
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
  attendanceBox: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 5,
  },
  attendanceText: {
    fontSize: 14,
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

export default EventShow;