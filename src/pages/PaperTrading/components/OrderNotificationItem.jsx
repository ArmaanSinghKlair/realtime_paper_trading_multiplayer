import React from "react";
import { Badge, Stack } from "react-bootstrap";
import { CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";
import { UserMarketOrder } from "../../../utils/candlestickChart";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import { useSelector } from "react-redux";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";

const OrderNotificationItem = ({order}) => {
    const userSecPosObj = useSelector(getUserSecurityInfo);
    return <Stack direction="horizontal" gap={3} className="mb-1">
            {order.status==UserMarketOrder.ORDER_STATUS_TYPE.FILLED ? 
            <CheckCircleFill className="text-success" style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            :
            <ExclamationCircleFill className="text-warning" style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            }
            
            <Stack>
                <span>Market order {order.status==UserMarketOrder.ORDER_STATUS_TYPE.FILLED ? 'executed':'rejected'} on</span>
                <span className="app-fs-sm">{userSecPosObj.curSecurityDetails.symbol}</span>
                <span>
                    <Badge bg={order.orderSide==UserMarketOrder.ORDER_SIDE_TYPE.BUY ? 'primary':'danger'} className={`fw-normal app-fs-sm bg-opacity-25 ${order.orderSide==UserMarketOrder.ORDER_SIDE_TYPE.BUY ? 'text-primary':'text-danger'}`}>
                        {order.orderSide==UserMarketOrder.ORDER_SIDE_TYPE.BUY ? 'Buy':'Sell'} <PriceNumberFormatter>1900000</PriceNumberFormatter>
                    </Badge>
                    {order.status==UserMarketOrder.ORDER_STATUS_TYPE.FILLED && (<span> at <PriceNumberFormatter>{order.price}</PriceNumberFormatter></span>)}
                </span>
                {order.status==UserMarketOrder.ORDER_STATUS_TYPE.REJECTED && (<span>{order.rejectionReason}</span>)}
            </Stack>
        </Stack>;
};

export default OrderNotificationItem;
