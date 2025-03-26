import React, { useEffect, useRef, useState } from "react";
import { Badge, Stack, Toast, ToastContainer } from "react-bootstrap";
import { CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { useImmer } from "use-immer";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import { UserMarketOrder } from "../../../utils/candlestickChart";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";
import OrderNotificationItem from "./OrderNotificationItem";

const OrderNotification = () => {
    let orders = new UserMarketOrder(1, 430, 1, UserMarketOrder.ORDER_SIDE_TYPE.BUY);
    orders.status = UserMarketOrder.ORDER_STATUS_TYPE.REJECTED;
    let orders1 = new UserMarketOrder(1, 430, 1, UserMarketOrder.ORDER_SIDE_TYPE.SELL);
    const [pendingOrders, setPendingOrders] = useImmer([orders, orders1]);
    const lastRemoveTimeRef = useRef(null);
    const userSecPosObj = useSelector(getUserSecurityInfo);
    const curTabMarketOrders = userSecPosObj.curUserMarketOrders;
    //Runs when market order added
    useEffect(()=>{
        if(!curTabMarketOrders || curTabMarketOrders.length==0){
            return;
        }
        setPendingOrders(draft=>{
            draft.push(curTabMarketOrders[curTabMarketOrders.length-1]);
        });

        //make sure we remove 2 seconds after the previous item is cleared
        let curTime = new Date().valueOf();
        let lastRemoveTime = lastRemoveTimeRef.current;
        if(!lastRemoveTime){
            lastRemoveTime = curTime;
        }
        let removeInterval = setTimeout(()=>{
            setPendingOrders(draft =>{
                draft.splice(0,1);  //remove 1st element from array
            });
        }, lastRemoveTime-curTime+2000);
        lastRemoveTimeRef.current = lastRemoveTime-curTime+2000;
        return ()=>{
            if(removeInterval){
                clearTimeout(removeInterval);
            }
        }
    }, [curTabMarketOrders]);
    // let message = pendingNotifs.map((notif)=>{

    //     return noti
    // }).join(<br />);
    return <>
    {pendingOrders.length > 0 &&
    <ToastContainer position="bottom-start" className="w-75" style={{ padding: '1rem' }}>
        <Toast delay={2000}>
            <Toast.Header>
            <strong className="me-auto">Your market orders</strong>
            </Toast.Header>
            <Toast.Body>
                {pendingOrders.map((order, index)=>{
                    return <>
                        <OrderNotificationItem order={order} key={index}/>
                        {index < pendingOrders.length-1 && <hr />}
                    </>
                })}
            </Toast.Body>
        </Toast>
    </ToastContainer>
    }
    </>;
};

export default OrderNotification;
