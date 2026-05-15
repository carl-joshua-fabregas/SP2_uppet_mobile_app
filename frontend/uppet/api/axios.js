import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const getBaseURL = () => {
  if (Constants.expoConfig?.hostUri) {
    const debuggerHost = Constants.expoConfig?.hostUri.split(":").shift();
    return `http://${debuggerHost}:5000`;
  }
  return "https://sp2-uppet-mobile-app.onrender.com";
};

console.log("Base URL:", getBaseURL());

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.log(err);
  }
  return config;
});

export { api, getBaseURL };
