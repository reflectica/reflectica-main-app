import {createSlice} from '@reduxjs/toolkit';

export interface Customer {
  id: string;
  name: string;
  email: string;
  // Add other customer fields as needed
}

interface CustomerState {
  customerProfile: Customer | null;
}

const initialState: CustomerState = {
  customerProfile: null,
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    addCustomer: (state, action) => {
      state.customerProfile = action.payload;
    },
    deleteCustomer: state => {
      state.customerProfile = null;
    },
  },
});

export const {addCustomer, deleteCustomer} = customerSlice.actions;

export default customerSlice.reducer;
