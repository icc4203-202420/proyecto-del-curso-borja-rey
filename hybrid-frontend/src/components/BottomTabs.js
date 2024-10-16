// src/components/BottomTabs.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Beers from '../screens/BeersScreen';
import Bars from '../screens/BarsScreen';
import Users from '../screens/UsersScreen';
import Home from '../screens/HomeScreen';
import { UserContext } from '../context/UserContext';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { currentUser } = useContext(UserContext);

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      {currentUser && <Tab.Screen name="Beers" component={Beers} />}
      {currentUser && <Tab.Screen name="Bars" component={Bars} />}
      {currentUser && <Tab.Screen name="Users" component={Users} />}
    </Tab.Navigator>
  );
}