import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice'
import userDetailsReducer from '../features/userDetails/userDetailsSlice'
import securityPriceReducer from '../features/securityPrice/securityPriceSlice'

export const store = configureStore({
    reducer: {
      theme: themeReducer,
      userDetails: userDetailsReducer,
      securityPrice: securityPriceReducer
    }
});