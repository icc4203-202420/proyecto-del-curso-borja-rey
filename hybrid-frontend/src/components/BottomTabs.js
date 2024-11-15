// src/components/BottomTabs.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Beers from '../screens/BeersScreen';
import Bars from '../screens/BarsScreen';
import Users from '../screens/UsersScreen';
import Home from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import { UserContext } from '../context/UserContext';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { currentUser } = useContext(UserContext);

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      {currentUser && (
        <Tab.Screen 
          name="Beers" 
          component={Beers} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="beer-outline" color={color} size={size} />
            ),
          }}
        />
      )}
      {currentUser && (
        <Tab.Screen 
          name="Bars" 
          component={Bars} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="wine-outline" color={color} size={size} />
            ),
          }}
        />
      )}
      {currentUser && (
        <Tab.Screen 
          name="Users" 
          component={Users} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="people-outline" color={color} size={size} />
            ),
          }}
        />
      )}
      {currentUser && (
        <Tab.Screen 
          name="Feed" 
          component={FeedScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="newspaper-outline" color={color} size={size} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}