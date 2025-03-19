import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice'
import userDetailsReducer from '../features/userDetails/userDetailsSlice'
import securityPriceReducer from '../features/securityPrice/securityPriceSlice'
import userSecurityPosReducer from '../features/userSecurityPos/userSecurityPosSlice'

export const store = configureStore({
    reducer: {
      theme: themeReducer,
      userDetails: userDetailsReducer,
      securityPrice: securityPriceReducer,
      userSecurityPos: userSecurityPosReducer
    }
});