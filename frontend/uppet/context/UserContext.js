import React, { createContext, useState, useEffect, useContext } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
const api = require("../api/axios");

GoogleSignin.configure({
  webClientId:
    "6734110788-rn5ibmvbnn7tf00hmr0lihi6ph9ma1fs.apps.googleusercontent.com",
  iosClientId:
    "6734110788-9lbc61k9u8dg4tebk8uppo4ve75ju28b.apps.googleusercontent.com",
});

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await SecureStore.setItemAsync("token", userToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("token");
    await GoogleSignin.signOut();
  };

  useEffect(() => {
    const loadingStorageData = async () => {
      setLoading(true);
      try {
        const savedToken = await SecureStore.getItemAsync("token");
        console.log("SAVED TOKEN IS RETREIVED");
        if (savedToken) {
          const userInfo = await GoogleSignin.signInSilently();
          console.log("CHECKING IF SAVED TOKEN IS VALID...");
          if (userInfo?.data?.idToken) {
            const res = await api.post("/api/auth/google", {
              token: {
                idToken: userInfo.data.idToken,
              },
            });
            if (res.data.status === "old_user") {
              await login(res.data.body, res.data.token);
              console.log("USER IS AN OLD USER");
            }
          }
        }
      } catch (err) {
        console.error("SAVED TOKEN ERROR", err);
        await logout();
      } finally {
        setLoading(false);
      }
    };
    loadingStorageData();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, token, loading, login, logout, setUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// const googleSilentSignIn = async () => {
//   try {
//     const userInfo = await GoogleSignin.signInSilently();

//     if (userInfo?.data?.idToken) {
//       const res = await api.post("/api/auth/google", {
//         token: {
//           idToken: userInfo.data.idToken,
//         },
//       });
//       if (res.data.status === "old_user") {
//         await login(res.data.body, res.data.token);
//         router.replace("(drawer)");
//       } else {
//         await logout();
//       }
//     }
//   } catch (error) {
//     console.log("google silent sign in error");
//   }
// };
