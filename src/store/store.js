import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice';
import tradingRoomInfoReducer, { buySecurityAsync, getTradingRoomGroupChats, getTradingRoomUsersInfo, getTradingRoomUtcStartTime, joinTradingRoomCurUser, leaveTradingRoomCurUser, leaveTradingRoomCurUserAsync, sellSecurityAsync, setTradingRoomStartUtcTime, userAddNewGroupChat, wsAddUserToTradingRoomAsync, wsAppendToTradingRoomGroupChat, wsAppendTradingRoomNotification, wsRemoveUserFromTradingRoomAsync } from '../features/tradingRoomInfo/tradingRoomInfoSlice';
import tradingSecurityInfoReducer, { addCurUserMarketOrder, getCurUserMarketOrders } from '../features/tradingSecurityInfo/tradingSecurityInfoSlice';
import userDetailsReducer, { getCurUserDetails, setUserDetails } from '../features/userDetails/userDetailsSlice';
import { WebSocketMessage, WebSocketMessagePayload, WebSocketUtil } from "../utils/webSocketUtils";
import { UserMarketOrder } from "../utils/candlestickChart";

/**
 * Allows access to websocket 3rd party connection through redux actions using middleware thunk
 * Assumes user to be already setup.
 * @param {*} param0 
 * @returns 
 */
const websocketMiddleware = ({dispatch, getState}) =>{
  let socket = null;
  let lastServerPongTime = null;
  let currentlyCatchingUp = false;
  const topicPrevPersistenceMap = new Map();  //store last received msgId for a topicId
  
  /**
   * Creates a websocket to https://github.com/ArmaanSinghKlair/realtime-websocket-microservice.git
   * @param {*} userId 
   * @returns 
   */
  const initializeWebsocket = (userId) =>{
    let socket = new WebSocket("ws://127.0.0.1/ws-service/websocket?userId="+userId);

    //setup ping-pong
    socket.onopen = () => {
      //setup ping pong loop with server. For socket maintenance purposes
      WebSocketUtil.setupPingPongLoop(socket);
    };

    /**
     * Handle messages received over websocket
     * @param {*} event 
     * @returns 
     */
    socket.onmessage = function(event) {
      const userDetails = getCurUserDetails(getState());
      const curTradingGroupMsgs = getTradingRoomGroupChats(getState());
      const tradingRoomUtcStartTime = getTradingRoomUtcStartTime(getState());
      const curUserMarketOrders = getCurUserMarketOrders(getState());
      const tradingRoomUserDetails = getTradingRoomUsersInfo(getState());

      const messageData = JSON.parse(event.data);
      if(messageData.createSubscriberId == userDetails.userId){
        // return;	//ignore messages created by myself. These messages may be useful in missed messages catchup
      }
      let payloadObj = null;
      if(messageData?.payload?.payloadValue){
        payloadObj = JSON.parse(messageData.payload.payloadValue);
      }

      //check if persistent messages lost or not
      if(messageData.previousPersistenceId){
        console.log('Got persistenet msg', messageData);
        //server in-midst of catching up lost persistent messages. When catchUp complete, then we can start accepting messages again.
        if(currentlyCatchingUp){
          return;
        }
        let storedPrevPersistenceId = topicPrevPersistenceMap.get(messageData.targetTopicId);
        if(storedPrevPersistenceId != messageData.previousPersistenceId){
          currentlyCatchingUp = true; //start catching up
          //notify server to rewind message stream to our last seen message and start sending messages from there
          let catchupMsg = new WebSocketMessage();
          catchupMsg.typeCd = WebSocketMessage.TYPE_CD_CATCHUP_REQUEST;
          catchupMsg.createSubscriberId = userDetails.userId;
          catchupMsg.targetTopicId = messageData.targetTopicId;
          catchupMsg.prevousPersistenceId = storedPrevPersistenceId;
          WebSocketUtil.sendMessage(socket, catchupMsg);
          return;
        }
      }
      if(messageData.persistenceId){
        topicPrevPersistenceMap.set(messageData.targetTopicId, messageData.persistenceId);
      }

      switch(messageData.typeCd){
        case WebSocketMessage.TYPE_CD_PUBLISH:
          switch(messageData.payload.typeCd){
            case WebSocketMessagePayload.TYPE_CD_MOUSE_COORDINATES:
              if(messageData.createSubscriberId != userDetails.userId){
                //moveCursor(payloadObj.userId, payloadObj.x, payloadObj.y);              
              }
            break;
            case WebSocketMessagePayload.TYPE_CD_CHAT_MESSAGE:
              //avoid double adding
              if(curTradingGroupMsgs && curTradingGroupMsgs.filter(msg=>msg.msgId == payloadObj.msgId).length > 0){
                break;
              }

              dispatch(wsAppendToTradingRoomGroupChat(payloadObj))
            break;
            case WebSocketMessagePayload.TYPE_CD_USER_ADDED_MARKET_ORDER:
              //avoid double adding
              if(curUserMarketOrders && curUserMarketOrders.filter(order=>order.orderId == payloadObj.orderId).length > 0){
                break;
              }
              
              let marketOrder = payloadObj;
              //If market order reached here, its already been validation against user's available funds. 
              //Just dummy execute the trade here
              let isBuyOrder = marketOrder.orderSide == UserMarketOrder.ORDER_SIDE_TYPE.BUY;
              // console.log('got user added marked order from others', payloadObj, 'isBuyOrder ',isBuyOrder);

              if(isBuyOrder){
                dispatch(buySecurityAsync(marketOrder));
              } else{
                dispatch(sellSecurityAsync(marketOrder));
              }

              //Show Notification to user as well
              dispatch(wsAppendTradingRoomNotification({
                ...messageData,
                //pass user data because we remove data right after this dispatch
                ...tradingRoomUserDetails[payloadObj.userId]
                }));
              break;
          }
        break;
        case WebSocketMessage.TYPE_CD_PONG:
          lastServerPongTime = messageData.createTimeUtcMs;
        break;
        case WebSocketMessage.TYPE_CD_CATCHUP_COMPLETE:
          currentlyCatchingUp = false;
        break;
        case WebSocketMessage.TYPE_CD_SUBSCRIBE:
          if(messageData.createSubscriberId == userDetails.userId){
            break;
          }

          switch(messageData.payload.typeCd){
            case WebSocketMessagePayload.TYPE_CD_USER_CONNECTED:
              //avoid double adding
              if(tradingRoomUserDetails[payloadObj.userId]){
                break;
              }

              dispatch(wsAddUserToTradingRoomAsync(payloadObj))
              if(!tradingRoomUtcStartTime){
                dispatch(setTradingRoomStartUtcTime(messageData.createTimeUtcMs));
              }

              //Show Notification to user after user added
              dispatch(wsAppendTradingRoomNotification(messageData));
            break;
          }
        break;
        case WebSocketMessage.TYPE_CD_UNSUBSCRIBE:
          if(messageData.createSubscriberId == userDetails.userId){
            break;
          }

          switch(messageData.payload.typeCd){
            case WebSocketMessagePayload.TYPE_CD_USER_DISCONNECTED:
              //avoid double removing
              if(!tradingRoomUserDetails[payloadObj.userId]){
                break;
              }
              //Show Notification to user as well
              dispatch(wsAppendTradingRoomNotification({
                ...messageData,
                //pass user data because we remove data right after this dispatch
                ...tradingRoomUserDetails[payloadObj.userId]
                }));
              
              dispatch(wsRemoveUserFromTradingRoomAsync(payloadObj.userId))
              break;
          }
        break;
      }
    };
    return socket;
  }

  /**
   * Now listen to action dispatches across the app.
   * For certain actions, send corresponding WS messages
   */
  return next => action =>{
    const userDetails = getCurUserDetails(getState());
    const tradingRoomUtcStartTime = getTradingRoomUtcStartTime(getState());

    //TODO: Remove. Only for testing purposes
    if(userDetails.userId && !socket){
      socket = initializeWebsocket(userDetails.userId, dispatch, getState);
    }

    switch(action.type){
      case setUserDetails.type:
        let userId = action.payload.userId;
        //Initialize websocket if not already when user is set
        if(!socket){
          socket = initializeWebsocket(userId, dispatch, getState);
        }
        break;
      case joinTradingRoomCurUser.type:
        //Triggered when user JOINS a trading room
        {
          //register subscribe to tradingRoom
          let subscriptTopicMsg = new WebSocketMessage();
          subscriptTopicMsg.typeCd = WebSocketMessage.TYPE_CD_SUBSCRIBE;
          subscriptTopicMsg.createSubscriberId = userDetails.userId;
          subscriptTopicMsg.targetTopicId = userDetails.curTradingRoomId;
          subscriptTopicMsg.persistentMsgCd = WebSocketMessage.PERSISTENT_MSG_CD_YES;
          //set trading start time as accurate as posssible
          if(tradingRoomUtcStartTime){
            subscriptTopicMsg.createTimeUtcMs = tradingRoomUtcStartTime;
          }
          let msgPayload = new WebSocketMessagePayload();
          msgPayload.typeCd = WebSocketMessagePayload.TYPE_CD_USER_CONNECTED;
          msgPayload.payloadValue = JSON.stringify(action.payload);
          subscriptTopicMsg.payload = msgPayload;
          WebSocketUtil.sendMessage(socket, subscriptTopicMsg);
        }
        break;
        case leaveTradingRoomCurUser.type:
          //Triggered when user LEAVES a trading room
          {
            //register subscribe to tradingRoom
            let subscriptTopicMsg = new WebSocketMessage();
            subscriptTopicMsg.typeCd = WebSocketMessage.TYPE_CD_UNSUBSCRIBE;
            subscriptTopicMsg.createSubscriberId = userDetails.userId;
            subscriptTopicMsg.targetTopicId = userDetails.curTradingRoomId;
            subscriptTopicMsg.persistentMsgCd = WebSocketMessage.PERSISTENT_MSG_CD_YES;
            
            let msgPayload = new WebSocketMessagePayload();
            msgPayload.typeCd = WebSocketMessagePayload.TYPE_CD_USER_DISCONNECTED;
            msgPayload.payloadValue = JSON.stringify(action.payload); //userId
            subscriptTopicMsg.payload = msgPayload;
            WebSocketUtil.sendMessage(socket, subscriptTopicMsg);
          }
          break;
      case userAddNewGroupChat.type:
        {
          let chatMsg = new WebSocketMessage();
          chatMsg.typeCd = WebSocketMessage.TYPE_CD_PUBLISH;
          chatMsg.createSubscriberId = userDetails.userId;
          chatMsg.targetTopicId = userDetails.curTradingRoomId;
          chatMsg.persistentMsgCd = WebSocketMessage.PERSISTENT_MSG_CD_YES;
          
          let msgPayload = new WebSocketMessagePayload();
          msgPayload.typeCd = WebSocketMessagePayload.TYPE_CD_CHAT_MESSAGE;
          msgPayload.payloadValue = JSON.stringify(action.payload);
          chatMsg.payload = msgPayload;
          WebSocketUtil.sendMessage(socket, chatMsg);
        }
        break;
      case addCurUserMarketOrder.type:
        let marketOrder = action.payload;
        console.log('trying to send market order to others...', marketOrder);
        //tell others you did something
        if(marketOrder.status == UserMarketOrder.ORDER_STATUS_TYPE.FILLED){
          let newMarketOrderMsg = new WebSocketMessage();
          newMarketOrderMsg.typeCd = WebSocketMessage.TYPE_CD_PUBLISH;
          newMarketOrderMsg.createSubscriberId = userDetails.userId;
          newMarketOrderMsg.targetTopicId = userDetails.curTradingRoomId;
          newMarketOrderMsg.persistentMsgCd = WebSocketMessage.PERSISTENT_MSG_CD_YES;
          
          let msgPayload = new WebSocketMessagePayload();
          msgPayload.typeCd = WebSocketMessagePayload.TYPE_CD_USER_ADDED_MARKET_ORDER;
          msgPayload.payloadValue = JSON.stringify(action.payload);
          newMarketOrderMsg.payload = msgPayload;
          WebSocketUtil.sendMessage(socket, newMarketOrderMsg);
        }
        break;
      
    }
    

    //Continue to next middleware in chain
    next(action);
  }
}

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    userDetails: userDetailsReducer,
    tradingSecurityInfo: tradingSecurityInfoReducer,
    tradingRoomInfo: tradingRoomInfoReducer
  },
  middleware: (getDefaultMiddleware)=>getDefaultMiddleware().concat(websocketMiddleware)
});