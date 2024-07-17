import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface User {
    // add user types as needed
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  confirmationResult: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  confirmationResult: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logoutUser: state => {
      state.isAuthenticated = false;
      state.user = null;
    },
    setConfirmationResult: (state, action: PayloadAction<any>) => {
      state.confirmationResult = action.payload;
    },
  },
});

export const {loginUser, logoutUser, setConfirmationResult} = authSlice.actions;

export default authSlice.reducer;
