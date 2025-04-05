import { createSlice } from "@reduxjs/toolkit";

/** Inital state && theme reducer */
const initialState = [
{
  userId: 2,
  msgId: '1-a',
  message: `Yo wassup people! Ready to make some money?? 🚀🚀`,
  timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
},
{
  userId: 1,
  msgId: '2-a',
  message: `You bet bruv`,
  timestamp: new Date(Date.now()-(9*60*1000)).valueOf() //x mins ago
},
{
  userId: 2,
  msgId: '3-a',
  message: `What strategy we're gonna test today though?`,
  timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
},
{
  userId: 1,
  msgId: '4-a',
  message: `I was thinking just quick scaling 😐. wdyt?`,
  timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
},
{
  userId: 2,
  msgId: '5-a',
  message: `That is fine, but like what exactly? Also which of the crytocurrencies should we be focusing on today? I've heeard bitcoin is fine, even though Solana is on the up and coming...idk 🤷`,
  timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
},
{
  userId: 1,
  msgId: '6-a',
  message: `I see what you mean!, Let's just resaerch more about this topic then :) wdyt?`,
  timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
},
]
const groupChatSlice = createSlice({
    name: 'groupChat',
    initialState,
    reducers: {
      appendChat(state, action){
        state.push(action.payload);
      }
    }
});

/** Export all ACTION CREATORS */
export const { appendChat } = groupChatSlice.actions;

//Selector
export const getGroupChats = (state) => state.groupChat;

// Export the generated reducer function
export default groupChatSlice.reducer;