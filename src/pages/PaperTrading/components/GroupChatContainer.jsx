import React, { useEffect, useRef } from "react";
import { Container, Row, Stack } from "react-bootstrap";
import { ChatDotsFill, SendFill } from "react-bootstrap-icons";
import { ICON_MEDIUM_SIZE, ICON_SMALL_SIZE } from "../../../styles/constants";
import { useSelector } from "react-redux";
import { generateMediumIntensityColor } from "../../../utils/genericUtils";

const GroupChatContainer = () => {
  const {userFirstName, userLastName, userColor, username} = useSelector(state => state.userDetails);
  const sendChatRef = useRef(null);
  useEffect(()=>{
    sendChatRef.current.focus();
  }, []);

  const messages = [
    {
      userId: 2,
      msgId: '1-a',
      username: 'Naman_Rana',
      message: `Yo wassup people! Ready to make some money?? 🚀🚀`,
      timestamp: new Date(Date.now()-(10*60*1000)) //x mins ago
    },
    {
      userId: 1,
      msgId: '2-a',
      username: 'Ak_47_',
      message: `You bet bruv`,
      timestamp: new Date(Date.now()-(9*60*1000)) //x mins ago
    },
    {
      userId: 3,
      msgId: '3-a',
      username: 'Naman_Rana',
      message: `What strategy we're gonna test today though?`,
      timestamp: new Date(Date.now()-(10*60*1000)) //x mins ago
    },
    {
      userId: 2,
      msgId: '4-a',
      username: 'Ak_47_',
      message: `I was thinking just quick scaling 😐. wdyt?`,
      timestamp: new Date(Date.now()-(10*60*1000)) //x mins ago
    },
    {
      userId: 3,
      msgId: '5-a',
      username: 'Naman_Rana',
      message: `That is fine, but like what exactly? Also which of the crytocurrencies should we be focusing on today? I've heeard bitcoin is fine, even though Solana is on the up and coming...idk 🤷`,
      timestamp: new Date(Date.now()-(10*60*1000)) //x mins ago
    },
    {
      userId: 2,
      msgId: '6-a',
      username: 'Ak_47_',
      message: `I see what you mean!, Let's just resaerch more about this topic then :) wdyt?`,
      timestamp: new Date(Date.now()-(10*60*1000)) //x mins ago
    },
  ]
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
                  return (
                  <Stack direction="horizontal" className="pt-2" gap={2} key={msg.msgId}>
                    <div className={`app-initials-profile-icon app-initials-profile-icon-md align-self-start`} style={{backgroundColor: generateMediumIntensityColor()}}>{msg.username.charAt(0)}</div>
                    <Stack>
                      <Stack direction="horizontal" gap={2}>
                        <span className="fw-medium">{msg.username}</span>
                        <span className="app-fs-sm text-body-secondary">{msg.timestamp.toLocaleDateString() == new Date().toLocaleDateString() ? 'Today' : msg.timestamp.toLocaleDateString()} at {msg.timestamp.toLocaleTimeString()}</span>
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
