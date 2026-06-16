import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchTractors = createAsyncThunk('tractor/fetchTractors', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/tractor', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const bookTractor = createAsyncThunk('tractor/bookTractor', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/booking', { ...bookingData, serviceType: 'Tractor' });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const tractorSlice = createSlice({
  name: 'tractor',
  initialState: {
    tractors: [],
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
      .addCase(fetchTractors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTractors.fulfilled, (state, action) => {
        state.loading = false;
        state.tractors = action.payload?.data || action.payload;
      })
      .addCase(fetchTractors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookTractor.fulfilled, (state) => {
        state.bookingSuccess = true;
      });
  }
});

export const { resetBookingState } = tractorSlice.actions;
export default tractorSlice.reducer;
