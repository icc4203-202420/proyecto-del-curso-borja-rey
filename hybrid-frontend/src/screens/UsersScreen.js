import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function UsersScreen() {
  return (
    <View style={styles.container}>
      <Text>Users Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UsersScreen;