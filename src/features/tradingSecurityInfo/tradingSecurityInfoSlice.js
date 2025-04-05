import { createSlice } from "@reduxjs/toolkit";
import { UserSecurityPriceData } from "../../utils/candlestickChart";
import { getUserSecurityPositions, updateUnrealizedPL } from "../tradingRoomInfo/tradingRoomInfoSlice";

/** Inital state && theme reducer */
let ethSec = new UserSecurityPriceData('COINBASE:ETHUSD', 'Ethereum / U.S. Dollar', 0.0001);

const initialState = {
  curUserMarketOrders: [],  //[{quantity, price, userId, placingTime, orderID}]
  latestSecurityPrice: null,
  curSecurityDetails: JSON.parse(JSON.stringify(ethSec)),
}

/**
 * Represents the security that will be traded by users on this platform
 */
const tradingSecurityInfoSlice = createSlice({
    name: 'tradingSecurityInfo',
    initialState,
    reducers: {
      updateChartLatestCandle(state, action){
        const latestClosePrice = action.payload;
        state.latestSecurityPrice = latestClosePrice;
      },
      addCurUserMarketOrder(state, action){
        state.curUserMarketOrders.push(action.payload);
      }
    }
});

/** Export all ACTION CREATORS */
export const { updateChartLatestCandle, addCurUserMarketOrder } = tradingSecurityInfoSlice.actions;

/**
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} candle ohlc candle data object
 * @returns 
 */
export const updateChartLatestCandleAsync = (chart, candle) => (dispatch, getState) =>{
  dispatch(updateChartLatestCandle(candle.close));  //update security price itself
  dispatch(updateUnrealizedPL(candle.close)); //update every user's positions
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here. Display not changed yet
  chart.updateLatestCandle(candle); //finally update candlestick chart display as well.
}


/** Export all SELECTOR FUNCTIONS (only 1 in this case but still helpful) */
export const getTradingSecurityInfo = state => state.tradingSecurityInfo;

  // Export the generated reducer function
export default tradingSecurityInfoSlice.reducer;