import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchPlumbers = createAsyncThunk('plumber/fetchPlumbers', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/plumber', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const bookPlumber = createAsyncThunk('plumber/bookPlumber', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/booking', { ...bookingData, serviceType: 'Plumber' });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const plumberSlice = createSlice({
  name: 'plumber',
  initialState: {
    plumbers: [],
    loading: false,
    error: null,
    bookingSuccess: false
  },
  reducers: {
    resetBookingState: (state) => {
      state.bookingSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlumbers.pending, (state) => { state.loading = true; })
      .addCase(fetchPlumbers.fulfilled, (state, action) => {
        state.loading = false;
        state.plumbers = action.payload?.data || action.payload;
      })
      .addCase(fetchPlumbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookPlumber.fulfilled, (state) => {
        state.bookingSuccess = true;
      });
  }
});

export const { resetBookingState } = plumberSlice.actions;
export default plumberSlice.reducer;
