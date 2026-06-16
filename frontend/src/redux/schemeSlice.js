import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchSchemes = createAsyncThunk('schemes/fetchSchemes', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/schemes', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const schemeSlice = createSlice({
  name: 'schemes',
  initialState: {
    schemes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchemes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSchemes.fulfilled, (state, action) => {
        state.loading = false;
        state.schemes = action.payload?.data || action.payload;
      })
      .addCase(fetchSchemes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default schemeSlice.reducer;
