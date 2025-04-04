import { createSlice } from "@reduxjs/toolkit";
import { UserInfoSecPos, UserMarketOrder, UserSecPosUtils, UserSecurityPosition, UserSecurityPriceData } from "../../utils/candlestickChart";
import { generateMediumIntensityColor } from "../../utils/genericUtils";

/** Inital state && theme reducer */
let userArmaan = new UserSecurityPosition(new UserInfoSecPos(1, 'Ak_47_', 'Armaan', 'Klair', 'green'));
let userNaman = new UserSecurityPosition(new UserInfoSecPos(2, 'nr_256', 'Naman', 'Rana', 'gold'));
let ethSec = new UserSecurityPriceData('COINBASE:ETHUSD', 'Ethereum / U.S. Dollar', 0.0001);

// let buyArmaan1 = new UserMarketOrder(1, 430, userArmaan.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.BUY);
// let sellArmaan2 = new UserMarketOrder(0.5, 415, userArmaan.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.SELL);
let buyNaman1 = new UserMarketOrder(1, 4110, userNaman.userInfo.userId, UserMarketOrder.ORDER_SIDE_TYPE.SELL);

// UserSecPosUtils.buySecurity(buyArmaan1, userArmaan);
// UserSecPosUtils.sellSecurity(sellArmaan2, userArmaan);
UserSecPosUtils.sellSecurity(buyNaman1, userNaman);

const initialState = {
  curUserMarketOrders: [],  //[{quantity, price, userId, placingTime, orderID}]
  latestSecurityPrice: null,
  curSecurityDetails: JSON.parse(JSON.stringify(ethSec)),
  userSecurityPos:{
    1: JSON.parse(JSON.stringify(userArmaan)),
    2: JSON.parse(JSON.stringify(userNaman))
  }
}
const userSecurityInfoSlice = createSlice({
    name: 'userSecurityInfo',
    initialState,
    reducers: {
      buySecurity(state, action){
        //action.paylod = UserMarketOrder
        UserSecPosUtils.buySecurity(action.payload, state.userSecurityPos[action.payload.userId]);
      },
      sellSecurity(state, action){
        //action.paylod = UserMarketOrder
        UserSecPosUtils.sellSecurity(action.payload, state.userSecurityPos[action.payload.userId]);
      },
      addUser(state, action){
        const {userId, username, userFirstName, userLastName} = action.payload;
        let userInfoObj = new UserInfoSecPos(userId, username, userFirstName, userLastName, generateMediumIntensityColor());
        state.userSecurityPos[userId] = new UserSecurityPosition(userInfoObj);
      },
      removeUser(state, action){
        const {userId} = action.payload;
        state.userSecurityPos[userId] = null;
      },
      updateChartLatestCandle(state, action){
        const latestClosePrice = action.payload;
        state.latestSecurityPrice = latestClosePrice;
        for(let userId in state.userSecurityPos){
          UserSecPosUtils.updateUnrealizedPL(latestClosePrice, state.userSecurityPos[userId]);
        }
      },
      addCurUserMarketOrder(state, action){
        state.curUserMarketOrders.push(action.payload);
      }
    }
});

/** Export all ACTION CREATORS */
export const { buySecurity, sellSecurity, addUser, removeUser, updateChartLatestCandle, addCurUserMarketOrder } = userSecurityInfoSlice.actions;

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
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} candle ohlc candle data object
 * @returns 
 */
export const updateChartLatestCandleAsync = (chart, candle) => (dispatch, getState) =>{
  dispatch(updateChartLatestCandle(candle.close));
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here. Display not changed yet
  chart.updateLatestCandle(candle); //finally update candlestick chart display as well.
}


/** Export all SELECTOR FUNCTIONS (only 1 in this case but still helpful) */
export const getUserSecurityPositions = state => state.userSecurityInfo.userSecurityPos;
export const getUserSecurityInfo = state => state.userSecurityInfo;

  // Export the generated reducer function
export default userSecurityInfoSlice.reducer;