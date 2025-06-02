import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../../apis/axiosClient';

// Async thunk để thêm bookmark
export const addBookmarkAsync = createAsyncThunk(
    'bookmark/addBookmarkAsync',
    async ({ restaurantId, username }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`bookmark/${restaurantId}`, {
                username
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk để xóa bookmark
export const removeBookmarkAsync = createAsyncThunk(
    'bookmark/removeBookmarkAsync',
    async ({ restaurantId, username }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete(`bookmark/${restaurantId}`, {
                data: { username }
            });
            return { restaurantId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk để lấy danh sách bookmark
export const fetchBookmarksAsync = createAsyncThunk(
    'bookmark/fetchBookmarksAsync',
    async (username, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`bookmark?username=${username}`);
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
        // Thêm bookmark local
        addBookmark: (state, action) => {
            const bookmark = action.payload;
            const exists = state.data.bookmarks.find(item => item.id === bookmark.id);
            
            if (!exists) {
                state.data.bookmarks.push(bookmark);
                // Lưu vào AsyncStorage
                AsyncStorage.setItem('bookmarks', JSON.stringify(state.data.bookmarks));
            }
        },

        // Xóa bookmark local
        removeBookmark: (state, action) => {
            const { id } = action.payload;
            state.data.bookmarks = state.data.bookmarks.filter(item => item.id !== id);
            // Lưu vào AsyncStorage
            AsyncStorage.setItem('bookmarks', JSON.stringify(state.data.bookmarks));
        },

        // Set bookmarks từ storage
        setBookmarks: (state, action) => {
            state.data.bookmarks = action.payload;
        },

        // Clear tất cả bookmarks
        clearBookmarks: (state) => {
            state.data.bookmarks = [];
            AsyncStorage.removeItem('bookmarks');
        }
    },
    extraReducers: (builder) => {
        builder
            // Add bookmark API
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

            // Remove bookmark API
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

            // Fetch bookmarks API
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

// Selectors
export const bookmarkSelector = (state) => state.bookmarkReducer.data;
export const bookmarksSelector = (state) => state.bookmarkReducer.data.bookmarks;

// Check if restaurant is bookmarked
export const isBookmarkedSelector = (state, restaurantId) => {
    return state.bookmarkReducer.data.bookmarks.some(item => item.id === restaurantId);
};

// Load bookmarks từ AsyncStorage
export const loadBookmarksFromStorage = async () => {
    try {
        const bookmarks = await AsyncStorage.getItem('bookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        return [];
    }
};