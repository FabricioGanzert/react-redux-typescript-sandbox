import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../../models/User';  // Import the User model

interface AddUserState {
  users: User[];  // Use User type here
  loading: boolean;
  error: string | null;
}

const url_listusers_api = import.meta.env.VITE_APP_USERS_LIST as string;

// Fetch users asynchronously with JWT protection via HTTP-only cookies
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await axios.get<User[]>(url_listusers_api, {
    withCredentials: true,  // Ensure the cookie is sent with the request
  });
  return response.data;
});

// Remove user asynchronously with JWT protection via HTTP-only cookies
export const removeUser = createAsyncThunk(
  'users/removeUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${url_listusers_api}/${userId}`, {
        withCredentials: true,  // Ensure the cookie is sent with the request
      });
      return userId; // return the userId so that we can remove the user from the state
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data.error || 'Failed to remove user');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Add user asynchronously with JWT protection via HTTP-only cookies
export const addUser = createAsyncThunk(
  'users/addUser',
  async (user: User, { rejectWithValue }) => {
    try {
      const response = await axios.post(url_listusers_api, user, {
        withCredentials: true,
      });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data.error || 'Failed to add user');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const initialState: AddUserState = {
  users: [],
  loading: false,
  error: null,
};

const addUserSlice = createSlice({
  name: 'addUser',
  initialState,
  reducers: {
    removeUser: (state, action: PayloadAction<number>) => {
      state.users.splice(action.payload, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Add User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload); // action.payload should be the complete user object
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add user';
      })
      // Remove User
      .addCase(removeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.userId !== action.payload);
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to remove user';
      });
  },
});

export default addUserSlice.reducer;
