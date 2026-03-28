import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const getBaseURL = () => {
  if (Constants.expoConfig?.hostUri) {
    const debuggerHost = Constants.expoConfig?.hostUri.split(":").shift();
    return `http://${debuggerHost}:5000`;
  }
  return "http://192.168.1.24:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.log(err);
  }
  return config;
});

module.exports = api;
