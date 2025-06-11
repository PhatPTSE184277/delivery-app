import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../../apis/axiosClient';

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async ({ foodId, userId }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`cart/${foodId}`, {
                userId
            });
            return response.data;
        } catch (error) {
            console.log('Error adding to cart:', error);
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to add item to cart'
            );
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async ({ foodId, userId }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.delete(`cart/${foodId}`, {
                data: { userId }
            });
            return { foodId, ...response.data };
        } catch (error) {
            console.log('Error removing from cart:', error);
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to remove item from cart'
            );
        }
    }
);

export const fetchCartAsync = createAsyncThunk(
    'cart/fetchCartAsync',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`cart?userId=${userId}`);
            return response.data;
        } catch (error) {
            console.log('Error fetching cart:', error);
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch cart items'
            );
        }
    }
);

const initialState = {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        data: initialState
    },
    reducers: {
        addToCart: (state, action) => {
            const { id, name, price, image, count = 1 } = action.payload;
            const existingItemIndex = state.data.items.findIndex(
                (item) => item.id === id
            );

            if (existingItemIndex >= 0) {
                // Item already exists, update count
                state.data.items[existingItemIndex].count += count;
            } else {
                // Add new item
                state.data.items.push({
                    id,
                    name,
                    price,
                    image,
                    count
                });
            }

            // Update totals
            state.data.totalItems = state.data.items.reduce(
                (sum, item) => sum + item.count,
                0
            );
            state.data.totalAmount = state.data.items.reduce(
                (sum, item) => sum + item.price * item.count,
                0
            );

            // Sync to local storage
            syncCartToLocal(state.data);
        },

        removeFromCart: (state, action) => {
            const { id } = action.payload;
            const existingItemIndex = state.data.items.findIndex(
                (item) => item.id === id
            );

            if (existingItemIndex >= 0) {
                const currentItem = state.data.items[existingItemIndex];

                if (currentItem.count === 1) {
                    state.data.items = state.data.items.filter(
                        (item) => item.id !== id
                    );
                } else {
                    state.data.items[existingItemIndex].count -= 1;
                }

                state.data.totalItems = state.data.items.reduce(
                    (sum, item) => sum + item.count,
                    0
                );
                state.data.totalAmount = state.data.items.reduce(
                    (sum, item) => sum + item.price * item.count,
                    0
                );


                syncCartToLocal(state.data);
            }
        },

        clearCart: (state) => {
            state.data = initialState;
            syncCartToLocal(initialState);
        },

        setCartItems: (state, action) => {
            state.data = action.payload;
            syncCartToLocal(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.data.loading = true;
                state.data.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.data.loading = false;
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.data.loading = false;
                state.data.error = action.payload;
                console.error(
                    'Failed to add item to cart in database:',
                    action.payload
                );
            })

            .addCase(removeFromCartAsync.pending, (state) => {
                state.data.loading = true;
                state.data.error = null;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.data.loading = false;
                console.log(
                    'Item removed from cart in database:',
                    action.payload
                );
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.data.loading = false;
                state.data.error = action.payload;
                console.error(
                    'Failed to remove item from cart in database:',
                    action.payload
                );
            })

            .addCase(fetchCartAsync.pending, (state) => {
                state.data.loading = true;
                state.data.error = null;
            })
            .addCase(fetchCartAsync.fulfilled, (state, action) => {
                state.data.loading = false;
                if (action.payload && action.payload.data) {
                    const cartItems = action.payload.data.map((item) => ({
                        id: item.foodId,
                        name: item.food?.name || 'Unknown Product',
                        price: item.food?.price || 0,
                        image: item.food?.image || '',
                        count: item.count || 1
                    }));

                    state.data.items = cartItems;

                    state.data.totalItems = cartItems.reduce(
                        (sum, item) => sum + item.count,
                        0
                    );
                    state.data.totalAmount = cartItems.reduce(
                        (sum, item) => sum + item.price * item.count,
                        0
                    );

                    syncCartToLocal(state.data);
                }
            })
            .addCase(fetchCartAsync.rejected, (state, action) => {
                state.data.loading = false;
                state.data.error = action.payload;
                console.error('Failed to fetch cart items:', action.payload);
            });
    }
});

export const cartReducer = cartSlice.reducer;
export const { addToCart, removeFromCart, clearCart, setCartItems } =
    cartSlice.actions;

export const cartSelector = (state) => state.cartReducer.data;
export const cartItemsSelector = (state) => state.cartReducer.data.items;
export const cartTotalSelector = (state) => state.cartReducer.data.totalAmount;
export const cartCountSelector = (state) => state.cartReducer.data.totalItems;
export const cartLoadingSelector = (state) => state.cartReducer.data.loading;
export const cartErrorSelector = (state) => state.cartReducer.data.error;

export const itemInCartSelector = (state, itemId) => {
    const item = state.cartReducer.data.items.find(
        (item) => item.id === itemId
    );
    return item ? item.count : 0;
};

const syncCartToLocal = (data) => {
    AsyncStorage.setItem('Cart_Data', JSON.stringify(data));
};

export const loadCartFromStorage = async () => {
    try {
        const cartData = await AsyncStorage.getItem('Cart_Data');
        if (cartData) {
            return JSON.parse(cartData);
        }
        return initialState;
    } catch (error) {
        console.error('Error loading cart data:', error);
        return initialState;
    }
};
