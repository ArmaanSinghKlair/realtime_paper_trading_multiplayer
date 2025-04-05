import { createSlice } from "@reduxjs/toolkit";
import { UserInfoSecPos, UserMarketOrder, UserSecPosUtils, UserSecurityPosition } from "../../utils/candlestickChart";
import { generateMediumIntensityColor } from "../../utils/genericUtils";

/** Inital state && theme reducer */
let userArmaan = new UserSecurityPosition(new UserInfoSecPos(1, 'Ak_47_', 'Armaan', 'Klair', 'green'));
let userNaman = new UserSecurityPosition(new UserInfoSecPos(2, 'nr_256', 'Naman', 'Rana', 'darkgreen'));

// let buyArmaan1 = new UserMarketOrder(1, 430, userArmaan.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.BUY);
// let sellArmaan2 = new UserMarketOrder(0.5, 415, userArmaan.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.SELL);
let buyNaman1 = new UserMarketOrder(1, 4110, userNaman.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.SELL);

// UserSecPosUtils.buySecurity(buyArmaan1, userArmaan);
// UserSecPosUtils.sellSecurity(sellArmaan2, userArmaan);
UserSecPosUtils.sellSecurity(buyNaman1, userNaman);

const initialState = {
  userSecurityPos:{
    1: JSON.parse(JSON.stringify(userArmaan)),
    2: JSON.parse(JSON.stringify(userNaman))
  },
  userInfoObj: {
    2: {
      userId: 2,
      userFirstName: 'Naman',
      userLastName: 'Rana',
      username: 'nr_256',
      userColor: 'darkgreen',
    }
  }
}
const groupUserInfoSlice = createSlice({
    name: 'groupUserInfo',
    initialState,
    reducers: {
      addUser(state, action){
        const {userId, username, userFirstName, userLastName} = action.payload;
        let userInfoObj = new UserInfoSecPos(userId, username, userFirstName, userLastName, generateMediumIntensityColor());
        state.userSecurityPos[userId] = JSON.parse(JSON.stringify(new UserSecurityPosition(userInfoObj)));
      },
      removeUser(state, action){
        const {userId} = action.payload;
        state.userSecurityPos[userId] = null;
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
      setUserInfoObj(state, action){
        state.userInfoObj[action.payload.userId] = action.payload;  //set user details
      }
    }
});

/** Export all ACTION CREATORS */
export const { addUser, removeUser, updateUnrealizedPL, buySecurity, sellSecurity } = groupUserInfoSlice.actions;

//Selector
export const getUserSecurityPositions = state => state.groupUserInfo?.userSecurityPos;
export const getGroupUserInfo = state => state.groupUserInfo;
export const getGroupUserDetailInfo = state => getGroupUserInfo(state).userInfoObj;

/**
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} userInfo UserInfoSecPos 
 * @returns 
 */
export const addUserAsync = (chart, userInfo) => (dispatch, getState) =>{
  dispatch(addUser(userInfo));
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Redux async thunk for removing a user's secu rity pos.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} param1 
 * @returns 
 */
export const removeUserAsync = (chart, userInfo) => (dispatch, getState) =>{
  dispatch(removeUser(userInfo));
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Redux async thunk for buying security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} userMarketOrder UserMarketOrder
 * @returns 
 */
export const buySecurityAsync = (chart, userMarketOrder) => (dispatch, getState) =>{
  dispatch(buySecurity(userMarketOrder));
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} userMarketOrder UserMarketOrder
 * @returns 
 */
export const sellSecurityAsync = (chart, userMarketOrder) => (dispatch, getState) =>{
  dispatch(sellSecurity(userMarketOrder));
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

// Export the generated reducer function
export default groupUserInfoSlice.reducer;