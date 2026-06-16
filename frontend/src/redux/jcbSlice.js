import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchJCBs = createAsyncThunk('jcb/fetchJCBs', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/jcb', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const bookJCB = createAsyncThunk('jcb/bookJCB', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/booking', { ...bookingData, serviceType: 'JCB' });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const jcbSlice = createSlice({
  name: 'jcb',
  initialState: {
    jcbs: [],
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
      .addCase(fetchJCBs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJCBs.fulfilled, (state, action) => {
        state.loading = false;
        state.jcbs = action.payload?.data || action.payload;
      })
      .addCase(fetchJCBs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookJCB.fulfilled, (state) => {
        state.bookingSuccess = true;
      });
  }
});

export const { resetBookingState } = jcbSlice.actions;
export default jcbSlice.reducer;
