import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  cart: localStorage.getItem("cartItems") 
    ? JSON.parse(localStorage.getItem("cartItems")) 
    : [],
  checkOutCart: localStorage.getItem("checkOutCart") 
    ? JSON.parse(localStorage.getItem("checkOutCart")) 
    : [],
};

export const cartReducer = createReducer(initialState, {
  addToCart: (state, action) => {
    const item = action.payload;
    const isItemExist = state.cart.find((i) => i._id === item._id);
    if (isItemExist) {
      return {
        ...state,
        cart: state.cart.map((i) =>
          i._id === isItemExist._id ? { ...i, qty: item.qty } : i
        ),
      };
    } else {
      return {
        ...state,
        cart: [...state.cart, item],
      };
    }
  },

  removeFromCart: (state, action) => {
    return {
      ...state,
      cart: state.cart.filter((i) => i._id !== action.payload),
    };
  },
  

  addCheckout: (state, action) => {
    const items = action.payload;
    return {
      ...state,
      checkOutCart: items.map((item) => {
        const existingItem = state.checkOutCart.find((i) => i._id === item._id);
        if (existingItem) {
          return { ...item, qty: existingItem.qty };
        } else {
          return item;
        }
      }),
    };
  },
});
