import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchLabours = createAsyncThunk('labour/fetchLabours', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/labour', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const bookLabour = createAsyncThunk('labour/bookLabour', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/booking', { ...bookingData, serviceType: 'Labour' });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const labourSlice = createSlice({
  name: 'labour',
  initialState: {
    labours: [],
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
      .addCase(fetchLabours.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabours.fulfilled, (state, action) => {
        state.loading = false;
        state.labours = action.payload?.data || action.payload;
      })
      .addCase(fetchLabours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookLabour.fulfilled, (state) => {
        state.bookingSuccess = true;
      });
  }
});

export const { resetBookingState } = labourSlice.actions;
export default labourSlice.reducer;
