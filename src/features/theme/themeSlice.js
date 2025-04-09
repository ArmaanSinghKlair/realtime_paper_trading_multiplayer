import { createSlice } from "@reduxjs/toolkit"
import { LOCAL_CACHE_THEME_SLICE_KEY } from "../../store/storeConstants"

export const THEME_SLICE_VALUES = {
  DARK: "dark",
  LIGHT: "light"
}

/** Inital state && theme reducer */
const initialState = {
    currentTheme: localStorage.getItem(LOCAL_CACHE_THEME_SLICE_KEY) || THEME_SLICE_VALUES.DARK
}

/**
 * Theme slice reducer
 * - Handles theme related state and actions
 */
const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
      updateTheme(state, action){
        state.currentTheme = action.payload;
      }
    }
});

/** Export all ACTION CREATORS */
export const { updateTheme } = themeSlice.actions;

/** Async Thunk that talks to brower API */
export const updateThemeAsync = newTheme => dispatch =>{
  if(!Object.values(THEME_SLICE_VALUES).includes(newTheme)){
    throw new Error("Invalid theme value passed");
  }
  document.documentElement.setAttribute("data-bs-theme", newTheme); // Apply to <html>
  localStorage.setItem(LOCAL_CACHE_THEME_SLICE_KEY, newTheme);
  dispatch(updateTheme(newTheme));
}

/** Export all SELECTOR FUNCTIONS (only 1 in this case but still helpful) */
export const getCurrentTheme = state => state.theme?.currentTheme;

  // Export the generated reducer function
export default themeSlice.reducer;