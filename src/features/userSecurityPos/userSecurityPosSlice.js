import { createSlice } from "@reduxjs/toolkit";
import { UserInfoSecPos, UserSecPosUtils, UserSecurityPosition } from "../../utils/candlestickChart";

/** Inital state && theme reducer */
let userArmaan = new UserSecurityPosition(new UserInfoSecPos(1, 'Ak_47_', 'Armaan', 'Klair', 'green'));
let userNaman = new UserSecurityPosition(new UserInfoSecPos(2, 'nr_256', 'Naman', 'Rana', 'gold'));
UserSecPosUtils.buySecurity(1, 430, userArmaan);
UserSecPosUtils.sellSecurity(0.5, 4150, userArmaan);
UserSecPosUtils.buySecurity(1, 4110, userNaman);

const initialState = {
  1: JSON.parse(JSON.stringify(userArmaan)),
  2: JSON.parse(JSON.stringify(userNaman))
}
const userSecurityPosSlice = createSlice({
    name: 'userSecurityPos',
    initialState,
    reducers: {
      buySeurity(state, action){
        const {quantity, price, userId} = action.payload;
        UserSecPosUtils.buySecurity(quantity, price, state[userId]);
      },
      sellSecurity(state, action){
        const {quantity, price, userId} = action.payload;
        UserSecPosUtils.sellSecurity(quantity, price, state[userId]);
      },
      addUser(state, action){
        const {userId, username, firstName, lastName} = action.payload;
        let userInfoObj = new UserInfoSecPos(userId, username, firstName, lastName);
        state[userId] = new UserSecurityPosition(userInfoObj);
      },
      removeUser(state, action){
        const {userId} = action.payload;
        state[userId] = null;
      },
      updateChartLatestCandle(state, action){
        const latestClosePrice = action.payload;
        for(let userId in state){
          UserSecPosUtils.updateUnrealizedPL(latestClosePrice, state[userId]);
        }
      }
    }
});

/** Export all ACTION CREATORS */
export const { buySecurity, sellSecurity, addUser, removeUser, updateChartLatestCandle } = userSecurityPosSlice.actions;

/**
 * Redux async thunk for buying security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} buySecDetailsObj {quantity, price, userId} 
 * @returns 
 */
export const buySecurityAsync = (chart, buySecDetailsObj) => (dispatch, getState) =>{
  dispatch(buySecurity(buySecDetailsObj));
  chart.updateUserSecPos(getUserSecurityPositions(getState())); //updated state here
}

/**
 * Redux async thunk for selling security.
 * Updates redux state AND updates the candleslick chart as well.
 * @param {*} chart 
 * @param {*} sellSecDetailsObj {quantity, price, userId}  
 * @returns 
 */
export const sellSecurityAsync = (chart, sellSecDetailsObj) => (dispatch, getState) =>{
  dispatch(sellSecurity(sellSecDetailsObj));
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
export const getUserSecurityPositions = state => state.userSecurityPos;

export const getUserSecMarketValue = (state, userId, price) => Math.abs(state.userSecurityPos[userId].ownedQuantity) * price;

export const getUserSecEquity = (state, userId) => {
  let userSecPos = state.userSecurityPos[userId];
  return userSecPos.accountBalance+ userSecPos.unrealizedPL;
}

export const getAvgFillPrice = (state, userId) => {
  let userSecPos = state.userSecurityPos[userId];
  return userSecPos.ownedQuantity > 0 ? userSecPos.avgBuyPrice : userSecPos.avgSellPrice
}

/**
	 * Display account and position details
	 * @param {number} price - Current market price
	 */
export const getUserPositionSummaryHtml = (state, userId) => {
  let userSecPos = state.userSecurityPos[userId];
  // Calculate key metrics
  // const marketValue = this.getMarketValue(price); // Value of current position
  // const equity = this.getEquity(); // Total account value
  // const availableFunds = this.accountBalance; // Simplified: No margin/leverage
  // const avgFillPrice = this.getAvgFillPrice(); // Avg price based on position

  return `
    <table>
      <tr><td><b>Name</b><td> <td>${userSecPos.userInfo.firstName} ${userSecPos.userInfo.lastName} (${userSecPos.userInfo.username})</td></tr>
      <tr><td><b>Account Balance</b><td> <td>${userSecPos.accountBalance.toFixed(2)} USD</td></tr>
      <tr><td><b>Unrealized P&L</b><td> <td>${userSecPos.unrealizedPL.toFixed(2)} USD</td></tr>
      <tr><td><b>Owned Quantity</b><td> <td>${userSecPos.ownedQuantity}</td></tr>
    </table>
  `;
  // console.log("\n--- Account Details ---");
  // console.log(`Current Market Price: $${price}`);
  // console.log(`Owned Quantity: ${this.ownedQuantity}`);
  // console.log(`Avg Fill Price: $${avgFillPrice || 0}`);
  // console.log(`Market Value: $${marketValue.toFixed(2)}`);
  // console.log(`Account Balance: $${this.accountBalance.toFixed(2)}`);
  // console.log(`Unrealized P&L: $${this.unrealizedPL.toFixed(2)}`);
  // console.log(`Realized P&L: $${this.realizedPL.toFixed(2)}`);
  // console.log(`Equity: $${equity.toFixed(2)}`);
  // console.log(`Available Funds: $${availableFunds.toFixed(2)}`);
  // console.log("------------------------");
}

  // Export the generated reducer function
export default userSecurityPosSlice.reducer;