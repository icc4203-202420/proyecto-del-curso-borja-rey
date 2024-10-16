import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/screens/LoginScreen';
import Signup from './src/screens/SignupScreen';
import Beers from './src/screens/BeersScreen';
import Bars from './src/screens/BarsScreen';
import Users from './src/screens/UsersScreen';
import BeerShow from './src/screens/BeerShowScreen';
import BeerReviews from './src/screens/BeerReviews';
import BottomTabs from './src/components/BottomTabs';  // Mover Bottom Tabs a un componente separado

const Stack = createStackNavigator();

export default function AppNavigation() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('current_user');
      setCurrentUser(user ? JSON.parse(user) : null);
      console.log('Current user:', user);
      setLoading(false);
    };
    checkUser();
  }, []);

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}