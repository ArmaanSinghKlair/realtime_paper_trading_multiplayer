import React from "react";
import { useSelector } from "react-redux";
import { getTradingRoomCursorPositions } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";
import MousePointer from "./MousePointer";

/**
 * Mouse pointers container component.
 * This component renders mouse pointers for each user in the trading room.
 * @returns {JSX.Element}
 */
const MousePointersContainer = () => {
    const mouseCoordinates = useSelector(getTradingRoomCursorPositions)
    return <>
    {
        Object.keys(mouseCoordinates).map((userId) => {
            const coordinates = mouseCoordinates[userId];
            return <MousePointer key={userId} userId={userId} coordinates={coordinates} />;
        })
    }
    </>;
};

export default MousePointersContainer;
