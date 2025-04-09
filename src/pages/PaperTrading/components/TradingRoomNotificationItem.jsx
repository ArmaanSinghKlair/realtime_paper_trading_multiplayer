import React from "react";
import { Activity, BoxArrowInLeft, BoxArrowInRight } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { getTradingRoomUsersInfo } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";
import { UserMarketOrder } from "../../../utils/candlestickChart";
import { WebSocketMessage, WebSocketMessagePayload } from "../../../utils/webSocketUtils";
import { Badge, Stack } from "react-bootstrap";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";
import QuantityNumberFormattter from "../../../components/common/QuantityNumberFormattter";

/**
 * Notification content shown to users due to actions taken by users in the trading room.
 * @param {*} param0 
 * @returns 
 */
const TradingRoomNotificationItem = ({wsPayload}) => {
    let notifContent = null;
    let notifIcon = null;
    console.log('got notification', wsPayload);
    let payloadObj = JSON.parse(wsPayload.payload.payloadValue);
    const tradingRoomUserDetails = useSelector(getTradingRoomUsersInfo);

    switch(wsPayload.typeCd){
        case WebSocketMessage.TYPE_CD_SUBSCRIBE:
            switch(wsPayload.payload.typeCd){
                case WebSocketMessagePayload.TYPE_CD_USER_CONNECTED:
                    notifIcon = <BoxArrowInLeft className="text-primary" style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}}/>;
                    notifContent = <>
                        <Stack>
                            <span><span className="fw-bold" style={{color:wsPayload.userColor}}>{payloadObj.username}</span> ({payloadObj.userFirstName} {payloadObj.userLastName})</span>
                            <span> just joined the room <span className="text-primary"></span></span>
                        </Stack>
                    </>;
                break;
            }
        break;
        case WebSocketMessage.TYPE_CD_UNSUBSCRIBE:
            switch(wsPayload.payload.typeCd){
                case WebSocketMessagePayload.TYPE_CD_USER_DISCONNECTED:
                    notifIcon = <BoxArrowInRight className="text-warning" style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}}/>;
                    notifContent = <>
                        <Stack>
                            <span><span className="fw-bold">{wsPayload.username}</span> ({wsPayload.userFirstName} {wsPayload.userLastName})</span> 
                            <span> left the room.</span>
                        </Stack>
                        </>;
                break;
            }
        break;
        case WebSocketMessage.TYPE_CD_PUBLISH:
            switch(wsPayload.payload.typeCd){
                case WebSocketMessagePayload.TYPE_CD_USER_ADDED_MARKET_ORDER:
                    notifIcon = <Activity className="text-primary" style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}}/>;
                    let isBuyOrder = payloadObj.orderSide == UserMarketOrder.ORDER_SIDE_TYPE.BUY;
                    notifContent = <>
                        <Stack>
                            <span>
                                <span className="fw-bold" style={{color:wsPayload.userColor}}>{wsPayload.username}</span> ({wsPayload.userFirstName} {wsPayload.userLastName})</span>
                            <span>
                                <Badge bg={isBuyOrder ? 'primary':'danger'} className={`fw-normal app-fs-sm bg-opacity-25 ${isBuyOrder ? 'text-primary':'text-danger'}`}>
                                    {isBuyOrder ? 'Buy':'Sell'} <QuantityNumberFormattter>{payloadObj.quantity}</QuantityNumberFormattter>
                                </Badge>
                                <span> at <PriceNumberFormatter>{payloadObj.price}</PriceNumberFormatter></span>
                            </span>
                        </Stack>
                        </>;
                break;
            }
        break;
    }
    return <Stack direction="horizontal" gap={3} className="mb-1">
            {notifIcon}
            {notifContent}
        </Stack>;
};

export default TradingRoomNotificationItem;
