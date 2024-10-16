// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await AsyncStorage.getItem('current_user');
      setCurrentUser(user ? JSON.parse(user) : null);
      setLoading(false);
    };
    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};