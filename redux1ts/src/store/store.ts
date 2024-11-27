// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import addUserReducer from './slices/addUserSlice';
import authReducer from './slices/authSlice'; // Import the authReducer

const store = configureStore({
  reducer: {
    addUser: addUserReducer,
    auth: authReducer, // Add the authReducer to manage login state
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
