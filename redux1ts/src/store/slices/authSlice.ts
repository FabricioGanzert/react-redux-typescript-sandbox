// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../models/User';

interface AuthState {
  isLoggedIn: boolean;
  userData: User | null; // Allow null for userData
}

const initialState: AuthState = {
  isLoggedIn: false,
  userData: null, // Default value is null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setUserData: (state, action: PayloadAction<User | null>) => {
      state.userData = action.payload; // Handle both User and null
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null; // Clear user data on logout
    },
  },
});

export const { setLoginStatus, setUserData, logout } = authSlice.actions;
export default authSlice.reducer;
