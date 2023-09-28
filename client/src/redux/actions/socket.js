
export const addNewNotifMessage = (data) => async (dispatch, getState) => {
    dispatch({
      type: "newNotifMessage",
      payload: data,
    });
    return data;
  };

  export const updateNotifMessage = (data) => async (dispatch, getState) => {
    dispatch({
      type: "updateNotifMessage",
      payload: data,
    });
    return data;
  }