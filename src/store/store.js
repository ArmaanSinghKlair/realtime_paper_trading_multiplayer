import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice'
import userDetailsReducer from '../features/userDetails/userDetailsSlice'
import userSecurityInfoReducer from '../features/userSecurityInfo/userSecurityInfoSlice'

export const store = configureStore({
    reducer: {
      theme: themeReducer,
      userDetails: userDetailsReducer,
      userSecurityInfo: userSecurityInfoReducer
    }
});