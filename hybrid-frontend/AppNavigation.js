import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/screens/LoginScreen';
import Signup from './src/screens/SignupScreen';
import Beers from './src/screens/BeersScreen';
import Bars from './src/screens/BarsScreen';
import Users from './src/screens/UsersScreen';
import BeerShow from './src/screens/BeerShowScreen';
import BottomTabs from './src/components/BottomTabs';  // Mover Bottom Tabs a un componente separado

const Stack = createStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        {/* Ocultamos el header para la pantalla que tiene el Bottom Tabs */}
        <Stack.Screen 
          name="Main" 
          component={BottomTabs} 
          options={{ headerShown: false }}  // Esto oculta la barra superior
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Beers" component={Beers} />
        <Stack.Screen name="Bars" component={Bars} />
        <Stack.Screen name="Users" component={Users} />
        <Stack.Screen name="BeerShow" component={BeerShow} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
