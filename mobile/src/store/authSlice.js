import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  isHydrated: false,
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
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      if (action.payload.user) {
        state.user = action.payload.user;
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      AsyncStorage.setItem('accessToken', action.payload.accessToken);
      AsyncStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
    },
    setHydrationStatus: (state, action) => {
      state.isHydrated = action.payload;
    },
    hydrateAuth: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isHydrated = true;
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setHydrationStatus, hydrateAuth } = authSlice.actions;

export const loadAuthState = () => async (dispatch) => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (accessToken) {
      dispatch(hydrateAuth({
        user: userStr ? JSON.parse(userStr) : null,
        accessToken,
        refreshToken
      }));
    } else {
      dispatch(setHydrationStatus(true));
    }
  } catch (e) {
    console.error('Failed to load auth state', e);
    dispatch(setHydrationStatus(true));
  }
};

export default authSlice.reducer;
