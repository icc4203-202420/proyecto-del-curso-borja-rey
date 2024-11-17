import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../context/urlContext';
import { UserContext } from '../context/UserContext';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'New Friend Added',
    body: 'You have added a new friend!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId = Constants.manifest.extra.eas.projectId;
    if (!projectId) {
      alert('Project ID not found');
      return;
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      alert(`Error getting push token: ${e}`);
    }
  } else {
    alert('Must use physical device for push notifications');
  }
}

const UserShow = () => {
  const route = useRoute();
  const { id } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const { currentUser } = useContext(UserContext);
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch(error => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('events');
        setEvents(response.data.events);
      } catch (error) {
        console.error('Error fetching Events:', error);
      }
    };

    const fetchIsFriend = async () => {
      const isFriendValues = {
        user_id: currentUser.id,
        friend_id: id,
      };
      try {
        const response = await axiosInstance.post(`users/${id}/is_friend`, { friendship: isFriendValues });
        setIsFriend(response.data.is_friend);
      } catch (error) {
        console.error('Error fetching is friend:', error);
      }
    };

    fetchIsFriend();
    fetchEvents();
  }, [id, currentUser]);

  const handleNewFriend = async () => {
    const friendshipValues = {
      user_id: currentUser.id,
      friend_id: id,
      event_id: selectedEvent,
    };
    try {
      const response = await axiosInstance.post(`users/${id}/friendships`, { friendship: friendshipValues });
      console.log('Friendship created:', response.data);
      if (response.data.friend_id) {
        setIsFriend(true);
        if (expoPushToken) {
          await sendPushNotification(expoPushToken);
        }
      }
    } catch (error) {
      console.error('Error creating friendship:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#AF8F6F" />;
  }

  if (!user) {
    return <Text style={styles.message}>User not found.</Text>;
  }

  return (
    currentUser ? (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.paper}>
          <View style={styles.box}>
            <Text style={styles.title}>{user.handle}</Text>
            <Text style={styles.subtitle}>{user.first_name} {user.last_name}, {user.age || 'N/A'} years old</Text>
            <Text style={styles.subtitle}>{user.email || 'N/A'}</Text>
          </View>
          <View style={styles.box}>
            {!isFriend ? (
              <View style={styles.friendContainer}>
                <Picker
                  selectedValue={selectedEvent}
                  onValueChange={(itemValue) => setSelectedEvent(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Event" value={0} />
                  {events
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((event) => (
                      <Picker.Item key={event.id} label={event.name} value={event.id} />
                    ))}
                </Picker>
                <TouchableOpacity style={styles.buttonAdd} onPress={handleNewFriend}>
                  <Text style={styles.buttonText}>Add Friend</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.friendContainer}>
                <TouchableOpacity style={styles.buttonIs}>
                  <Text style={styles.buttonText2}>You are already friends!!!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.box}>
            <TouchableOpacity style={styles.buttonView} onPress={() => navigation.navigate('Main')}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    ) : (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error 401</Text>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F4E1',
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
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    height: 50,
  },
  buttonAdd: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonIs: {
    backgroundColor: '#F8F4E1',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonView: {
    backgroundColor: '#AF8F6F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Belwe',
  },
  buttonText2: {
    color: 'black',
    fontFamily: 'Belwe',
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
  errorText: {
    fontSize: 32,
    fontFamily: 'Belwe',
    color: '#000',
  },
});

export default UserShow;