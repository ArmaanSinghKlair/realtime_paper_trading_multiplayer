import { createSlice } from "@reduxjs/toolkit";
import { createRandomString, generateMediumIntensityColor } from "../../utils/genericUtils";

/** Inital state && theme reducer */
const initialState = {
    // userId: 1,
    // userFirstName: 'Armaan',
    // userLastName: 'Klair',
    // username: 'Ak_47_',
    // userColor: generateMediumIntensityColor(),
    // curTradingRoomId: 1,
}

/**
 * User details slice reducer
 * - Handles user details related state and actions
 */
const userDetailsSlice = createSlice({
    name: 'userDetails',
    initialState,
    reducers: {
      setUserDetails: {
        reducer: (state, action) => {
          return {
            ...state,
            ...action.payload
          }
        },
        //Adds a unique ID to each user. 
        prepare: (firstName, lastName, username) => {
          return {
            payload: {
              userId: createRandomString(),
              userFirstName: firstName,
              userLastName: lastName,
              username: username,
              userColor: generateMediumIntensityColor()
            }
          }
        }
      },
      setTradingRoomId(state, action){
        state.curTradingRoomId = action.payload;
      }
    }
});

/** Export all ACTION CREATORS */
export const { setUserDetails, setTradingRoomId } = userDetailsSlice.actions;

//Selector
export const getCurUserDetails = (state) => state.userDetails;

// Export the generated reducer function
export default userDetailsSlice.reducer;