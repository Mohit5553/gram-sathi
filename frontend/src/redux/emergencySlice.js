import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchContacts = createAsyncThunk('emergency/fetchContacts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/emergency', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const emergencySlice = createSlice({
  name: 'emergency',
  initialState: {
    contacts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload?.data || action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default emergencySlice.reducer;
