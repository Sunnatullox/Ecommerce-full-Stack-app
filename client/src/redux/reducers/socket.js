import { createAction, createReducer } from "@reduxjs/toolkit";
import { useEffect } from "react";

const initialState = {
  messages: localStorage.getItem("notifMessage") 
  ? JSON.parse(localStorage.getItem("notifMessage")) 
  : [],
};



export const notifMessage = createReducer(initialState, {
  newNotifMessage: (state, action) => {
    const message = action.payload;
    const isMatching = state.messages.some((item) =>
    item.conversationId === message.conversationId &&
    item.sender === message.sender &&
    ((message?.text && item?.text === message?.text) || (message.images && item.images?.public_id === message.images?.public_id))
  )

    if(!isMatching){
      localStorage.setItem("notifMessage", JSON.stringify([...state.messages, message]))
      return {
        ...state,
        messages: [...state.messages, message],
      };
    }
    return state
  },

  updateNotifMessage: (state, action) => {
    const newMessages = action.payload;
    localStorage.setItem("notifMessage", JSON.stringify(newMessages));
    return {
      ...state,
      messages: newMessages,
    };
  },
});

