import React, { useEffect, useRef } from "react";
import { Container, Stack } from "react-bootstrap";
import { ChatDotsFill, SendFill } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { getTradingRoomGroupChats, getTradingRoomUsersInfo } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";
import { getCurUserDetails } from "../../../features/userDetails/userDetailsSlice";
import { ICON_SMALL_SIZE } from "../../../styles/constants";

const GroupChatContainer = () => {
  const curUserDetails = useSelector(getCurUserDetails);
  const tradingRoomUserDetails = useSelector(getTradingRoomUsersInfo);

  const sendChatRef = useRef(null);
  useEffect(()=>{
    sendChatRef.current.focus();
  }, []);

  const messages = useSelector(getTradingRoomGroupChats);
  return <>
    <Stack className="h-100">
      <Container fluid style={{height: '10%'}} className="px-0">
        <Stack direction='horizontal' gap={3} >
            <ChatDotsFill style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            <span className='app-card-title'>Group Chat</span>
        </Stack>
      </Container>
      <Container fluid style={{height: '90%'}} className="px-0">
          <Stack className="bg-body-secondary border rounded-top-4" style={{height: '85%'}}>
            <Container fluid className="overflow-auto h-100">
              {
                messages.map(msg=>{
                  let userInfoObj = msg.userId == curUserDetails.userId ? curUserDetails : tradingRoomUserDetails[msg.userId];
                  return (
                  <Stack direction="horizontal" className="pt-2" gap={2} key={msg.msgId}>
                    <div className={`app-initials-profile-icon app-initials-profile-icon-md align-self-start`} style={{backgroundColor: userInfoObj.userColor}}>{userInfoObj.username.charAt(0)}</div>
                    <Stack>
                      <Stack direction="horizontal" gap={2}>
                        <span className="fw-medium">{userInfoObj.username}</span>
                        <span className="app-fs-sm text-body-secondary">{new Date(msg.timestamp).toLocaleDateString() == new Date().toLocaleDateString() ? 'Today' : new Date(msg.timestamp).toLocaleDateString()} at {new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </Stack>
                      <span>{msg.message}</span>
                    </Stack>
                  </Stack>);
                })
              }
              
            </Container>
          </Stack>
          <Stack className="mt-auto bg-body-secondary rounded-bottom-4 border px-4" style={{height: '15%'}} direction="horizontal" gap={2}>
            <input ref={sendChatRef} className="flex-grow-1 app-input-no-style" type="text" placeholder="Send Message..."></input>
            <SendFill style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} className="cursor-pointer app-hover-dull"/>
          </Stack>
        </Container>
      </Stack>
  </>;
};

export default GroupChatContainer;
