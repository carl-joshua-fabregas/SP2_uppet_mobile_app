import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";
import { getBaseURL } from "../api/axios";

const SocketContext = createContext();
const SOCKETURL = getBaseURL();
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const { user, token } = useUser();

  useEffect(() => {
    console.log("---------------In Socket Context--------------");
    if (!token || !user) {
      if (socket) {
        console.log("Disconnecting socket");
        socket.disconnect();
        console.log("Socket Disconnect Successful");
      }
      setSocket(null);
      return;
    }
    const newSocket = io(SOCKETURL, {
      auth: { token: token },
      query: { userId: user._id },
    });
    if (!newSocket) return;
    newSocket.on("connect_error", (err) => {
      console.log("SOCKET ERROR IN FRONTEND", err.message);
    });
    setSocket(newSocket);
    console.log("SUCCESSFUL IN CONNECTING ", newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [token, user?._id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
