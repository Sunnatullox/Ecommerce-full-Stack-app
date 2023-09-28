// add to cart
export const addTocart = (data) => async (dispatch, getState) => {
  dispatch({
    type: "addToCart",
    payload: data,
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cart));
  return data;
};

// remove from cart
export const removeFromCart = (data) => async (dispatch, getState) => {
  dispatch({
    type: "removeFromCart",
    payload: data._id,
  });
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cart));
  return data;
};
// add to checkout list
export const addCheckoutList = (data) => async (dispatch, getState) => {
  dispatch({
    type: "addCheckout",
    payload: data,
  })
  localStorage.setItem("checkOutCart", JSON.stringify(data));
  return data;
}
