import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducers/authReducer";
import { cartReducer } from "./reducers/cartReducer";
import { bookmarkReducer } from "./reducers/bookmarkReducer";

const store = configureStore({
    reducer: {
        authReducer,
        cartReducer,
        bookmarkReducer
    },
    devTools: true
});

export default store;