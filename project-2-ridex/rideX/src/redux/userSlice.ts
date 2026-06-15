import { createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface iUserState {
  userData: any | null;
}

// Define the initial state using that type
const initialState: iUserState = {
  userData: null,
};

export const userSlice = createSlice({
  name: "user",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
