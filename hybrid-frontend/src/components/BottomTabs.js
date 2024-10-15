import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BarsScreen from '../screens/BarsScreen';
import BeersScreen from '../screens/BeersScreen';
import UsersScreen from '../screens/UsersScreen';
import HomeScreen from '../screens/HomeScreen';  // Home screen que también estará en el Tab

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bars" component={BarsScreen} />
      <Tab.Screen name="Beers" component={BeersScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
    </Tab.Navigator>
  );
}
