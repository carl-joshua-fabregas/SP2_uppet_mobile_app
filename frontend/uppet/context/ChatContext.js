import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);

  // The Optimistic Update Function
  // Inside ChatContext.js
  const updateInboxPreview = (conversationId, newText, receiverName) => {
    setChatList((prevChats) => {
      const chatIndex = prevChats.findIndex((c) => c._id === conversationId);
      const updatedChats = [...prevChats];

      if (chatIndex !== -1) {
        // Chat exists: Update it and move to top
        updatedChats[chatIndex].lastMessage = { text: newText };
        const [movedChat] = updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(movedChat);
      } else {
        // NEW CHAT: It doesn't exist yet, so create a new inbox item!
        const newInboxItem = {
          _id: conversationId,
          receiverName: receiverName, // We need to pass this in now
          lastMessage: { text: newText },
          // ... any other defaults you need
        };
        updatedChats.unshift(newInboxItem);
      }

      return updatedChats;
    });
  };

  return (
    <ChatContext.Provider value={{ chatList, setChatList, updateInboxPreview }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChats = () => useContext(ChatContext);
