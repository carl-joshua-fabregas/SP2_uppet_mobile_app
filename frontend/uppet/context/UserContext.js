import React, { createContext, useState, useEffect, useContext } from "react";
import { Platform } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { api } from "../api/axios";

GoogleSignin.configure({
  webClientId:
    "6734110788-rn5ibmvbnn7tf00hmr0lihi6ph9ma1fs.apps.googleusercontent.com",
  iosClientId:
    "6734110788-9lbc61k9u8dg4tebk8uppo4ve75ju28b.apps.googleusercontent.com",
});

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [newUser, setNewUser] = useState(false);

  const login = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await SecureStore.setItemAsync("token", userToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setNewUser(false);
    await SecureStore.deleteItemAsync("token");
    await GoogleSignin.signOut();
  };

  const handleSignIn = async () => {
    if (signingIn) return;

    setSigningIn(true);
    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }
      const resGoogle = await GoogleSignin.signIn();

      if (resGoogle && resGoogle.idToken) {
        const { idToken } = resGoogle;

        const res = await api.post("/api/auth/google", {
          token: {
            idToken: idToken,
          },
        });

        if (res.data.status.toString() === "new_user") {
          const adopterData = {
            googleId: res.data.googleData.googleId,
          };
          setUser(adopterData);
          setNewUser(true);
        } else {
          setNewUser(false);
          await login(res.data.body, res.data.token);
        }
      }

      console.log("Success");
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("CANCELLED");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("PLAY SERVICE UNAVAILALE");
      } else {
        console.error(err);
      }
      logout();
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    const loadingStorageData = async () => {
      setLoading(true);
      try {
        const savedToken = await SecureStore.getItemAsync("token");
        if (savedToken) {
          const userInfo = await GoogleSignin.signInSilently();
          if (userInfo?.idToken) {
            const res = await api.post("/api/auth/google", {
              token: {
                idToken: userInfo.idToken,
              },
            });
            if (res.data.status === "old_user") {
              await login(res.data.body, res.data.token);
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
      value={{
        user,
        token,
        loading,
        login,
        logout,
        setUser,
        handleSignIn,
        newUser,
        setNewUser,
      }}
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
