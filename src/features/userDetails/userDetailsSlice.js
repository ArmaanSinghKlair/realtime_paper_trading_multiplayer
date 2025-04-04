import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { generateMediumIntensityColor } from "../../utils/genericUtils";

/** Inital state && theme reducer */
const initialState = {
    userId: 1,
    userFirstName: 'Armaan',
    userLastName: 'Klair',
    username: 'Ak_47_',
    userColor: generateMediumIntensityColor()
}
const userDetailsSlice = createSlice({
    name: 'userDetails',
    initialState,
    reducers: {
      setUserDetails: {
        reducer: (state, action) => {
          console.log('Got here as well AFTER prepare in REDUCER', action);
          return {
            ...state,
            ...action.payload
          }
        },
        //Adds a unique ID to each user. 
        prepare: (firstName, lastName, username) => {
          console.log('got here in prepare functions');
          return {
            payload: {
              userId: uuidv4(),
              userFirstName: firstName,
              userLastName: lastName,
              username: username,
              userColor: generateMediumIntensityColor()
            }
          }
        }
      }
    }
});

/** Export all ACTION CREATORS */
export const { setUserDetails } = userDetailsSlice.actions;

//Selector
export const getCurUserDetails = (state) => state.userDetails;

// Export the generated reducer function
export default userDetailsSlice.reducer;