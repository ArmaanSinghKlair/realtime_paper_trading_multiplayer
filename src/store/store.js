import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice'
import userDetailsReducer from '../features/userDetails/userDetailsSlice'
import securityPriceReducer from '../features/securityPrice/securityPriceSlice'
import userSecurityInfoReducer from '../features/userSecurityInfo/userSecurityInfoSlice'

export const store = configureStore({
    reducer: {
      theme: themeReducer,
      userDetails: userDetailsReducer,
      securityPrice: securityPriceReducer,
      userSecurityInfo: userSecurityInfoReducer
    }
});