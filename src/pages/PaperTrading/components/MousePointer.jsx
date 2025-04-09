import React from "react";
import { useSelector } from "react-redux";
import { getTradingRoomUsersInfo } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";

const MousePointer = ({coordinates, userId}) => {
  const tradingRoomUserDetails = useSelector(getTradingRoomUsersInfo)
  const { x, y } = coordinates;
  const userInfoObj = tradingRoomUserDetails[userId];
  console.log("coordinates", coordinates);

  return <div className="cursor-indicator"  style={{ left: x, top: y }}>
          <div className="cursor-arrow" style={{borderBottomColor: userInfoObj.userColor}}></div>
          <div className="cursor-name" style={{backgroundColor: userInfoObj.userColor}}>{userInfoObj.userFirstName}</div>
        </div>;
};

export default MousePointer;
