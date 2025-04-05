import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice';
import tradingRoomInfoReducer, { addUserAsync, appendToTradingRoomGroupChat, removeUserAsync } from '../features/tradingRoomInfo/tradingRoomInfoSlice';
import userDetailsReducer, { getCurUserDetails, setTradingRoomId } from '../features/userDetails/userDetailsSlice';
import tradingSecurityInfoReducer from '../features/tradingSecurityInfo/tradingSecurityInfoSlice';
import { WebSocketMessage, WebSocketMessagePayload, WebSocketUtil } from "../utils/webSocketUtils";

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
  const userDetails = getCurUserDetails(getState());
  
  const initializeWebsocket = (userId) =>{
    let socket = new WebSocket("ws://127.0.0.1/ws-service/websocket?userId="+userId);

    //setup ping-pong
    socket.onopen = () => {
      //setup ping pong loop with server. For socket maintenance purposes
      WebSocketUtil.setupPingPongLoop(socket);
    };

    socket.onmessage = function(event) {
      const messageData = JSON.parse(event.data);
      if(messageData.createSubscriberId == userDetails.userId){
      return;	//ignore messages created by myself. These messages may be useful in missed messages catchup
      }
      let payloadObj = null;
      if(messageData?.payload?.payloadValue){
        payloadObj = JSON.parse(messageData.payload.payloadValue);
      }
      
      if(messageData.persistentMsgCd == 1){
        console.log(messageData);
      }
      switch(messageData.typeCd){
        case WebSocketMessage.TYPE_CD_PUBLISH:
          //check if persistent messages lost or not
          if(messageData.previousPersistenceId){
            let storedPrevPersistenceId = topicPrevPersistenceMap.get(messageData.targetTopicId);
            if(storedPrevPersistenceId != messageData.previousPersistenceId){
              //server in-midst of catching up lost messages. When catchUp complete, then we can start accepting messages again.
              if(currentlyCatchingUp){
                return;
              }
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
          switch(messageData.payload.typeCd){
            case WebSocketMessagePayload.TYPE_CD_MOUSE_COORDINATES:
              //moveCursor(payloadObj.userId, payloadObj.x, payloadObj.y);              
            break;
            case WebSocketMessagePayload.TYPE_CD_CHAT_MESSAGE:
              dispatch(appendToTradingRoomGroupChat(payloadObj))
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
          switch(messageData.payload.typeCd){
          case WebSocketMessagePayload.TYPE_CD_USER_CONNECTED:
            userInfoMap.set(payloadObj.userId, payloadObj);	//add user's info
            dispatch(addUserAsync(payloadObj))
            // createCursor(payloadObj.userId, payloadObj.firstName)
            break;
          }
          break;
        case WebSocketMessage.TYPE_CD_UNSUBSCRIBE:
          switch(messageData.payload.typeCd){
            case WebSocketMessagePayload.TYPE_CD_USER_DISCONNECTED:
              dispatch(removeUserAsync(payloadObj))
              // removeCursor(payloadObj.userId);
              break;
          }
          break;
          
        }
    };
    return socket;
  }

  return next => action =>{
    //skip over websocket creation
    if(!userDetails.userId){
      next(action);
      return;
    }
    //Initialize websocket if not already
    if(!socket){
      socket = initializeWebsocket(userDetails.userId, dispatch, getState);
    }

    //Handle action
    if(socket && socket.readyState === WebSocket.OPEN){
      switch(action.type){
        case setTradingRoomId.type:
          //Triggered when user joins a trading room

          if(!action.payload){
            //happens when user quits a room
            //close and reopen socket.
            //Its a workaround for reregistering sockets. TODO have a better process
            socket.close();
            socket = initializeWebsocket(userDetails.userId);
          } else{
            //register subscribe to tradingRoom
            let subscriptTopicMsg = new WebSocketMessage();
            subscriptTopicMsg.typeCd = WebSocketMessage.TYPE_CD_SUBSCRIBE;
            subscriptTopicMsg.createSubscriberId = userDetails.userId;
            subscriptTopicMsg.targetTopicId = action.payload;
            subscriptTopicMsg.persistentMsgCd = WebSocketMessage.PERSISTENT_MSG_CD_YES;
            
            let msgPayload = new WebSocketMessagePayload();
            msgPayload.typeCd = WebSocketMessagePayload.TYPE_CD_USER_CONNECTED;
            msgPayload.payloadValue = JSON.stringify({ userId: userDetails.userId, username: userDetails.username, firstName: userDetails.userFirstName, lastName: userDetails.userLastName});
            subscriptTopicMsg.payload = msgPayload;
            WebSocketUtil.sendMessage(socket, subscriptTopicMsg);
          }
          break;
        case appendToTradingRoomGroupChat.type:
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
          break;
      }
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