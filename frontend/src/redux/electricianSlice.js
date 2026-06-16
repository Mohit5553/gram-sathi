import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchElectricians = createAsyncThunk('electrician/fetchElectricians', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/electrician', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const bookElectrician = createAsyncThunk('electrician/bookElectrician', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/booking', { ...bookingData, serviceType: 'Electrician' });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const electricianSlice = createSlice({
  name: 'electrician',
  initialState: {
    electricians: [],
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
      .addCase(fetchElectricians.pending, (state) => { state.loading = true; })
      .addCase(fetchElectricians.fulfilled, (state, action) => {
        state.loading = false;
        state.electricians = action.payload?.data || action.payload;
      })
      .addCase(fetchElectricians.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookElectrician.fulfilled, (state) => {
        state.bookingSuccess = true;
      });
  }
});

export const { resetBookingState } = electricianSlice.actions;
export default electricianSlice.reducer;
