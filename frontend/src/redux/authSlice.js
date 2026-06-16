import { createSlice } from '@reduxjs/toolkit';
import SecureLS from 'secure-ls';

// Handle CommonJS / ESM default export mismatch in Vite
const LS = typeof SecureLS === 'function' ? SecureLS : SecureLS.default;
const ls = new LS({ encodingType: 'aes' });

const getSecureData = (key) => {
  try {
    return ls.get(key) || null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: getSecureData('user'),
  token: getSecureData('token'),
  refreshToken: getSecureData('refreshToken'),
  isAuthenticated: !!getSecureData('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      
      const newToken = action.payload.accessToken || action.payload.token;
      if (newToken) {
        state.token = newToken;
        state.isAuthenticated = true;
        ls.set('token', newToken);
      }
      
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        ls.set('refreshToken', action.payload.refreshToken);
      }
      
      if (action.payload.user) {
        state.user = action.payload.user;
        ls.set('user', action.payload.user);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      ls.remove('user');
      ls.remove('token');
      ls.remove('refreshToken');
    },
    updateProfile: (state, action) => {
      state.user = action.payload;
      ls.set('user', action.payload);
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
