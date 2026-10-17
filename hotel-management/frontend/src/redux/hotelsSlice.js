import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { toErrorPayload } from '../services/api.js';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { filters, page, limit } = getState().hotels;

    const params = {
      limit,
      offset: (page - 1) * limit,
    };

    if (filters.search) params.search = filters.search;
    if (filters.minPrice !== '') params.minPrice = filters.minPrice;
    if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice;
    if (filters.rating !== '') params.rating = filters.rating;

    if (filters.roomType) params.roomType = filters.roomType;

    if (filters.facilities?.length) {
      params.facilities = filters.facilities;
    }

    try {
      const { data } = await api.get('/hotels', { params });
      return data;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/hotels/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/hotels', formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/hotels/${id}`, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/hotels/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: 6,

  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    facilities: [],
    roomType: '',
  },

  current: null,
  loading: false,
  detailLoading: false,
  saving: false,
  error: null,
  detailError: null,
  saveError: null,
};

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,

  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },

    setFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.page = 1;
    },

    clearFilters(state) {
      state.filters = {
        ...initialState.filters,
        facilities: [],
      };
      state.page = 1;
    },

    clearCurrent(state) {
      state.current = null;
      state.detailError = null;
      state.saveError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to load hotels';
      })

      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.current = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message || 'Failed to load hotel';
      })

      .addCase(createHotel.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(createHotel.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
      })

      .addCase(updateHotel.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateHotel.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
      })

      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (hotel) => hotel.id !== action.payload
        );
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const {
  setPage,
  setFilters,
  clearFilters,
  clearCurrent,
} = hotelsSlice.actions;

export default hotelsSlice.reducer;
