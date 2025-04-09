import React, { useEffect, useRef, useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import { ChatDotsFill, SendFill } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { userAddNewGroupChatAsync, getTradingRoomGroupChats, getTradingRoomUsersInfo } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";
import { getCurUserDetails } from "../../../features/userDetails/userDetailsSlice";
import { ICON_SMALL_SIZE } from "../../../styles/constants";

/**
 * Group chat container component.
 * This component handles the group chat functionality in the trading room.
 * It allows users to send and receive messages in the chat.
 * @returns 
 */
const GroupChatContainer = () => {
  const curUserDetails = useSelector(getCurUserDetails);
  const tradingRoomUserDetails = useSelector(getTradingRoomUsersInfo);
  const [newChatMsg, setNewChatMsg] = useState('');
  const sendChatRef = useRef(null);
  const storeDispatch = useDispatch();

  useEffect(()=>{
    sendChatRef.current.focus();
  }, []);

  const handleSendChatMsgSubmit = (event) =>{
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      storeDispatch(userAddNewGroupChatAsync(newChatMsg));
    } 
  }
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
              {
                (!messages || messages.length==0) && <>
                  <Stack className="align-items-center pt-3">
                    <span className="fs-5">No chats yet</span>
                    <span className="app-fs-sm">Start the conversation!</span>
                  </Stack>
                </>
              }
            </Container>
          </Stack>
          <Form className="mt-auto bg-body-secondary rounded-bottom-4 border px-4 d-flex justify-content-between align-items-center gap-2" style={{height: '15%'}} onSubmit={handleSendChatMsgSubmit}>
            <Form.Control
              value={newChatMsg}
              className="flex-grow-1 app-input-no-style"
              onChange={(e)=>setNewChatMsg(e.target.value)}
              ref={sendChatRef}
              placeholder="Send Message..."
              required
              />
            <Button className="app-input-no-style" type="submit"><SendFill style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} role="button" className="cursor-pointer app-hover-dull"/></Button>
          </Form>
        </Container>
      </Stack>
  </>;
};

export default GroupChatContainer;
