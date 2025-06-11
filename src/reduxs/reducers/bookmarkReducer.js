import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../../apis/axiosClient';

export const addBookmarkAsync = createAsyncThunk(
    'bookmark/addBookmarkAsync',
    async ({ restaurantId, userId }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`bookmark/${restaurantId}`, {
                userId
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeBookmarkAsync = createAsyncThunk(
    'bookmark/removeBookmarkAsync',
    async ({ restaurantId, userId }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete(`bookmark/${restaurantId}`, {
                data: { userId }
            });
            return { restaurantId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBookmarksAsync = createAsyncThunk(
    'bookmark/fetchBookmarksAsync',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`bookmark?userId=${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    bookmarks: [],
    loading: false,
    error: null
};

const bookmarkSlice = createSlice({
    name: 'bookmark',
    initialState: {
        data: initialState
    },
    reducers: {
        addBookmark: (state, action) => {
            const bookmark = action.payload;
            const exists = state.data.bookmarks.find(item => item.id === bookmark.id);
            
            if (!exists) {
                state.data.bookmarks.push(bookmark);
                AsyncStorage.setItem('bookmarks', JSON.stringify(state.data.bookmarks));
            }
        },

        removeBookmark: (state, action) => {
            const { id } = action.payload;
            state.data.bookmarks = state.data.bookmarks.filter(item => item.id !== id);
            AsyncStorage.setItem('bookmarks', JSON.stringify(state.data.bookmarks));
        },

        setBookmarks: (state, action) => {
            state.data.bookmarks = action.payload;
        },

        clearBookmarks: (state) => {
            state.data.bookmarks = [];
            AsyncStorage.removeItem('bookmarks');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addBookmarkAsync.pending, (state) => {
                state.data.loading = true;
            })
            .addCase(addBookmarkAsync.fulfilled, (state, action) => {
                state.data.loading = false;
            })
            .addCase(addBookmarkAsync.rejected, (state, action) => {
                state.data.loading = false;
                state.data.error = action.payload;
            })

            .addCase(removeBookmarkAsync.pending, (state) => {
                state.data.loading = true;
            })
            .addCase(removeBookmarkAsync.fulfilled, (state, action) => {
                state.data.loading = false;
            })
            .addCase(removeBookmarkAsync.rejected, (state, action) => {
                state.data.loading = false;
                state.data.error = action.payload;
            })
            .addCase(fetchBookmarksAsync.pending, (state) => {
                state.data.loading = true;
            })
            .addCase(fetchBookmarksAsync.fulfilled, (state, action) => {
                state.data.loading = false;
                if (action.payload && action.payload.data) {
                    const bookmarks = action.payload.data.map(item => ({
                        id: item.restaurantId,
                        name: item.restaurant?.name || '',
                        image: item.restaurant?.image || '',
                        rating: item.restaurant?.rating || 0,
                        address: item.restaurant?.address || '',
                        description: item.restaurant?.description || ''
                    }));
                    state.data.bookmarks = bookmarks;
                    AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                }
            })
            .addCase(fetchBookmarksAsync.rejected, (state, action) => {
                state.data.loading = false;
                state.data.error = action.payload;
            });
    }
});

export const bookmarkReducer = bookmarkSlice.reducer;
export const { addBookmark, removeBookmark, setBookmarks, clearBookmarks } = bookmarkSlice.actions;

export const bookmarkSelector = (state) => state.bookmarkReducer.data;
export const bookmarksSelector = (state) => state.bookmarkReducer.data.bookmarks;

export const isBookmarkedSelector = (state, restaurantId) => {
    return state.bookmarkReducer.data.bookmarks.some(item => item.id === restaurantId);
};

export const loadBookmarksFromStorage = async () => {
    try {
        const bookmarks = await AsyncStorage.getItem('bookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        return [];
    }
};