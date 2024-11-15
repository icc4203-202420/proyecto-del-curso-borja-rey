import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Login from './src/screens/LoginScreen';
import Signup from './src/screens/SignupScreen';
import Beers from './src/screens/BeersScreen';
import Bars from './src/screens/BarsScreen';
import Users from './src/screens/UsersScreen';
import BeerShow from './src/screens/BeerShowScreen';
import BeerReviews from './src/screens/BeerReviews';
import CreatePicture from './src/screens/CreatePicture';
import EventPictures from './src/screens/EventPicturesScreen';
import EventShow from './src/screens/EventShowScreen';
import PictureShow from './src/screens/PictureShow';
import Feed from './src/screens/FeedScreen';
import BarShow from './src/screens/BarShowScreen';

import BottomTabs from './src/components/BottomTabs';  // Mover Bottom Tabs a un componente separado
import UserShow from './src/screens/UserShowScreen';

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function AppNavigation() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('current_user');
      setCurrentUser(user ? JSON.parse(user) : null);
      console.log('Current user:', user);
      setLoading(false);
    };
    checkUser();

    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    await AsyncStorage.setItem('expo_push_token', token); // Guarda el token en AsyncStorage
    return token;
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        {/* Ocultamos el header para la pantalla que tiene el Bottom Tabs */}
        <Stack.Screen 
          name="Main" 
          component={props => <BottomTabs {...props} currentUser={currentUser} />} 
          options={{ headerShown: false }}  // Esto oculta la barra superior
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Beers" component={Beers} />
        <Stack.Screen name="Bars" component={Bars} />
        <Stack.Screen name="Users" component={Users} />
        <Stack.Screen name="BeerShow" component={BeerShow} />
        <Stack.Screen name="BeerReviews" component={BeerReviews} />
        <Stack.Screen name="UserShow" component={UserShow} />
        <Stack.Screen name="CreatePicture" component={CreatePicture} />
        <Stack.Screen name="EventPictures" component={EventPictures} />
        <Stack.Screen name="EventShow" component={EventShow} />
        <Stack.Screen name="BarShow" component={BarShow} />
        <Stack.Screen name="Feed" component={Feed} />
        <Stack.Screen name="PictureShow" component={PictureShow} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}