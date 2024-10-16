import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";

import React from 'react';
import AppNavigation from './AppNavigation';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <UserProvider>
      <AppNavigation />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
