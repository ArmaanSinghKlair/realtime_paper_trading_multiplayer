import React, { Fragment, useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useImmer } from "use-immer";
import { getTradingSecurityInfo } from "../../../features/tradingSecurityInfo/tradingSecurityInfoSlice";
import OrderNotificationItem from "./OrderNotificationItem";

/**
 * OrderNotificationContainer component.
 * This component is responsible for displaying notifications for pending orders.
 * It uses the useImmer hook to manage the state of pending orders.
 * The component listens for changes in the current user's market orders and updates the notification accordingly.
 * @param {*} param0 
 * @returns 
 */
const OrderNotificationContainer = ({notificationTitle='Notifications'}) => {
    const [pendingOrders, setPendingOrders] = useImmer([]);
    const [showNotif, setShowNotif] = useState(true);
    const userSecPosObj = useSelector(getTradingSecurityInfo);
    let curTabMarketOrders = userSecPosObj.curUserMarketOrders;
    //Runs when market order added
    useEffect(()=>{
        if(!curTabMarketOrders || curTabMarketOrders.length==0){
            return;
        }
        let newMarketOrder = curTabMarketOrders[curTabMarketOrders.length-1];
        setPendingOrders(draft=>{
            draft.push(newMarketOrder);
        });
        setShowNotif(true);

        //Clear this notification after sometime also
        setTimeout(()=>{
            setPendingOrders(draft =>{
                draft.shift();  //remove 1st element from array
            });
        }, 4000);
    }, [curTabMarketOrders]);

    return <>
    {pendingOrders.length > 0 &&
    <ToastContainer position="bottom-start" style={{ padding: '1rem' }}>
        <Toast show={showNotif} onClose={()=>setShowNotif(!showNotif)} delay={2000}>
            <Toast.Header>
            <strong className="me-auto">{notificationTitle}</strong>
            </Toast.Header>
            <Toast.Body>
                {pendingOrders.map((order, index)=>{
                    return (
                    <Fragment key={order.orderId}>
                        <OrderNotificationItem order={order} />
                        {index < pendingOrders.length-1 && <hr />}
                    </Fragment>
                    )
                })}
            </Toast.Body>
        </Toast>
    </ToastContainer>
    }
    </>;
};

export default OrderNotificationContainer;
