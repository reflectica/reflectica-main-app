import {configureStore} from '@reduxjs/toolkit';
import authReducer from './auth/authSlices';
import customerReducer from './customers/customerSlices';

const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
