import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { generateMediumIntensityColor } from "../../utils/genericUtils";

/** Inital state && theme reducer */
const initialState = {
    userId: 123,
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
        reducer(state, action){
          state = {
            ...state,
            ...action.payload
          }
        },
        //Adds a unique ID to each user. 
        prepare(firstName, lastName, username){
          return {
            payload: {
              userId: uuidv4(),
              userFirstName: firstName,
              userLastName: lastName,
              username: username
            }
          }
        }
      }
    }
});

/** Export all ACTION CREATORS */
export const { setUserDetails } = userDetailsSlice.actions;

// Export the generated reducer function
export default userDetailsSlice.reducer;