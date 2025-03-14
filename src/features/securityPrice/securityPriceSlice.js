import { createSlice } from "@reduxjs/toolkit";

/** Inital state && theme reducer */
const initialState = {
    ohlcDataArr: []
}
const securityPriceSlice = createSlice({
    name: 'securityPrice',
    initialState,
    reducers: {
      setSecurityPrice(state, action){
        state.ohlcDataArr = action.payload;
      }
    }
});

/** Export all ACTION CREATORS */
export const { setSecurityPrice } = securityPriceSlice.actions;

/** Export all SELECTOR FUNCTIONS (only 1 in this case but still helpful) */
export const getCurOhlcArr = state => state.securityPrice?.ohlcDataArr;

  // Export the generated reducer function
export default securityPriceSlice.reducer;