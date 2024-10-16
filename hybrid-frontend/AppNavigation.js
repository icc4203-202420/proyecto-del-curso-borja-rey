import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/screens/LoginScreen';
import Signup from './src/screens/SignupScreen';
import BottomTabs from './src/components/BottomTabs';
import Home from './src/screens/HomeScreen';

const Stack = createStackNavigator();

export default function AppNavigation() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('current_user');
      setCurrentUser(user ? JSON.parse(user) : null);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* HomeScreen is always accessible */}
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        {currentUser ? (
          <Stack.Screen 
            name="Main" 
            component={BottomTabs} 
            options={{ headerShown: false }}  // No header in BottomTabs
          />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
