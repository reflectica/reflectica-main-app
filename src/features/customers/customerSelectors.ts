import {RootState} from '../store';
import {Customer} from './customerSlices';

export const selectCustomerProfile = (state: RootState): Customer | null =>
  state.customer.customerProfile;
