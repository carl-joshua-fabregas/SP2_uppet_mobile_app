import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadingStorageData = async () => {
      setLoading(true);
      try {
        const savedToken = await SecureStore.getItemAsync("token");
        if (savedToken) setToken(savedToken);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadingStorageData();
  }, []);

  const login = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await SecureStore.setItemAsync("token", userToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("token");
  };

  return (
    <UserContext.Provider
      value={{ user, token, loading, login, logout, setUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
