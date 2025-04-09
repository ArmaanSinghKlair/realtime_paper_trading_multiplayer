import { createSlice } from "@reduxjs/toolkit";
import { UserInfoSecPos, UserMarketOrder, UserSecPosUtils, UserSecurityPosition } from "../../utils/candlestickChart";
import { createRandomString } from "../../utils/genericUtils";
import { getCurUserDetails } from "../userDetails/userDetailsSlice";
import { WebSocketMessage, WebSocketMessagePayload } from "../../utils/webSocketUtils";

/** Inital state && theme reducer */
let userArmaan = new UserSecurityPosition(new UserInfoSecPos(1, 'Ak_47_', 'Armaan', 'Klair', 'green'));
let userNaman = new UserSecurityPosition(new UserInfoSecPos(2, 'nr_256', 'Naman', 'Rana', 'darkgreen'));

// let buyArmaan1 = new UserMarketOrder(1, 430, userArmaan.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.BUY);
// let sellArmaan2 = new UserMarketOrder(0.5, 415, userArmaan.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.SELL);
let buyNaman1 = new UserMarketOrder(1, 4110, userNaman.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.SELL);

// UserSecPosUtils.buySecurity(buyArmaan1, userArmaan);
// UserSecPosUtils.sellSecurity(sellArmaan2, userArmaan);
UserSecPosUtils.sellSecurity(buyNaman1, userNaman);

let subscriptTopicMsg = new WebSocketMessage();
subscriptTopicMsg.typeCd = WebSocketMessage.TYPE_CD_SUBSCRIBE;
subscriptTopicMsg.createSubscriberId = 2;
subscriptTopicMsg.targetTopicId = 1;
subscriptTopicMsg.persistentMsgCd = WebSocketMessage.PERSISTENT_MSG_CD_YES;
subscriptTopicMsg.createTimeUtcMs = new Date().valueOf()
let msgPayload = new WebSocketMessagePayload();
msgPayload.typeCd = WebSocketMessagePayload.TYPE_CD_USER_CONNECTED;
msgPayload.payloadValue = JSON.stringify({
  typeCd: 2,
  username: 'nr_256',
  userId: 2,
  userFirstName: 'Naman',
  userLastName: 'Rana'
});
subscriptTopicMsg.payload = msgPayload;
const initialState = {
  tradingRoomUtcStartTime: null,
  userSecurityPos:{
    // 1: JSON.parse(JSON.stringify(userArmaan)),
    2: JSON.parse(JSON.stringify(userNaman))
  },
  userDetails: {
    2: {
      userId: 2,
      userFirstName: 'Naman',
      userLastName: 'Rana',
      username: 'nr_256',
      userColor: 'darkgreen',
    }
  },
  groupChats:[
    // {
    //   userId: 2,
    //   msgId: '1-a',
    //   message: `Yo wassup people! Ready to make some money?? 🚀🚀`,
    //   timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
    // },
    // {
    //   userId: 1,
    //   msgId: '2-a',
    //   message: `You bet bruv`,
    //   timestamp: new Date(Date.now()-(9*60*1000)).valueOf() //x mins ago
    // },
    // {
    //   userId: 2,
    //   msgId: '3-a',
    //   message: `What strategy we're gonna test today though?`,
    //   timestamp: new Date(Date.now()-(10*60*1000)).valueOf() //x mins ago
    // },
    ],
    tradingRoomNotifications: [
      // JSON.parse(JSON.stringify(subscriptTopicMsg))
    ]
}
const tradingRoomInfoSlice = createSlice({
    name: 'tradingRoomInfo',
    initialState,
    reducers: {
      joinTradingRoomCurUser(state, action){
        const {userId, username, userFirstName, userLastName, userColor} = action.payload;
        let userInfo = new UserInfoSecPos(userId, username, userFirstName, userLastName, userColor);
        state.userSecurityPos[userId] = JSON.parse(JSON.stringify(new UserSecurityPosition(userInfo)));
        state.userDetails[userId] = action.payload;
      },
      wsAddUserToTradingRoom(state, action){
        const {userId, username, userFirstName, userLastName, userColor} = action.payload;
        let userInfo = new UserInfoSecPos(userId, username, userFirstName, userLastName, userColor);
        state.userSecurityPos[userId] = JSON.parse(JSON.stringify(new UserSecurityPosition(userInfo)));
        state.userDetails[userId] = action.payload;
      },
      leaveTradingRoomCurUser(state, action){
        const userId = action.payload;
        delete state.userSecurityPos[userId];
        delete state.userDetails[userId];
      },
      wsRemoveUserFromTradingRoom(state, action){
        const userId = action.payload;
        delete state.userSecurityPos[userId];
        delete state.userDetails[userId];
      },
      updateUnrealizedPL(state, action){
        let latestPrice = action.payload;
        for(let userId in state.userSecurityPos){
          UserSecPosUtils.updateUnrealizedPL(latestPrice, state.userSecurityPos[userId]);
        }
      },
      buySecurity(state, action){
        //action.paylod = UserMarketOrder
        UserSecPosUtils.buySecurity(action.payload, state.userSecurityPos[action.payload.userId]);
      },
      sellSecurity(state, action){
        //action.paylod = UserMarketOrder
        UserSecPosUtils.sellSecurity(action.payload, state.userSecurityPos[action.payload.userId]);
      },
      //adds gruop chats recieved via ws
      wsAppendToTradingRoomGroupChat(state, action){
        state.groupChats.push(action.payload);
      },
      //user added a new chat
      userAddNewGroupChat(state, action){
        state.groupChats.push(action.payload);
      },
      setTradingRoomStartUtcTime(state, action){
        state.tradingRoomUtcStartTime = action.payload;
      },
      wsAppendTradingRoomNotification(state, action){
        state.tradingRoomNotifications.push(action.payload);
      },
      dequeTradingRoomNotification(state, action){
        state.tradingRoomNotifications.shift();
      }
    }
});

/** Export all ACTION CREATORS */
export const { joinTradingRoomCurUser, wsAddUserToTradingRoom, leaveTradingRoomCurUser, wsRemoveUserFromTradingRoom, updateUnrealizedPL, buySecurity, sellSecurity, wsAppendToTradingRoomGroupChat, userAddNewGroupChat, setTradingRoomStartUtcTime, wsAppendTradingRoomNotification, unshiftTradingRoomNotification, dequeTradingRoomNotification } = tradingRoomInfoSlice.actions;

//Selector
export const getTradingRoomInfo = state => state.tradingRoomInfo;
export const getUserSecurityPositions = state => getTradingRoomInfo(state)?.userSecurityPos;
export const getTradingRoomUsersInfo = state => getTradingRoomInfo(state).userDetails;
export const getTradingRoomGroupChats = state => getTradingRoomInfo(state).groupChats;
export const getTradingRoomUtcStartTime = state => getTradingRoomInfo(state).tradingRoomUtcStartTime;
export const getTradingRoomNotifications = state => getTradingRoomInfo(state).tradingRoomNotifications;

/**
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} userInfo UserInfoSecPos 
 * @returns 
 */
export const joinTradingRoomCurUserAsync = (userInfo) => (dispatch, getState) =>{
  dispatch(joinTradingRoomCurUser(userInfo));
  window.candlestickChart.updateUserSecPos(getUserSecurityPositions(getState())); //update chart as well
}

export const wsAddUserToTradingRoomAsync = (userInfo) => (dispatch, getState) =>{
  dispatch(wsAddUserToTradingRoom(userInfo));
  window.candlestickChart.updateUserSecPos(getUserSecurityPositions(getState())); //update chart as well
}

/**
 * Redux async thunk for removing a user's secu rity pos.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} param1 
 * @returns 
 */
export const leaveTradingRoomCurUserAsync = (userId) => (dispatch, getState) =>{
  dispatch(leaveTradingRoomCurUser(userId));
  window.candlestickChart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

export const wsRemoveUserFromTradingRoomAsync = (userId) => (dispatch, getState) =>{
  dispatch(wsRemoveUserFromTradingRoom(userId));
  window.candlestickChart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Redux async thunk for buying security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} userMarketOrder UserMarketOrder
 * @returns 
 */
export const buySecurityAsync = (userMarketOrder) => (dispatch, getState) =>{
  dispatch(buySecurity(userMarketOrder));
  window.candlestickChart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} userMarketOrder UserMarketOrder
 * @returns 
 */
export const sellSecurityAsync = (userMarketOrder) => (dispatch, getState) =>{
  dispatch(sellSecurity(userMarketOrder));
  window.candlestickChart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Need access to redux store before appending a chat message.
 * @param {*} msg 
 * @returns 
 */
export const userAddNewGroupChatAsync = (msg) => (dispatch, getState) =>{
  const curUserDetails = getCurUserDetails(getState());
  dispatch(userAddNewGroupChat({
    userId: curUserDetails.userId,
    msgId: createRandomString(),
    message: msg,
    timestamp: new Date().valueOf()
  }));
}
// Export the generated reducer function
export default tradingRoomInfoSlice.reducer;