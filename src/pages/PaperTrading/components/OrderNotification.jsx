import React, { Fragment, useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useImmer } from "use-immer";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import OrderNotificationItem from "./OrderNotificationItem";

const OrderNotificationContainer = ({notificationTitle='Notifications'}) => {
    const [pendingOrders, setPendingOrders] = useImmer([]);
    const [showNotif, setShowNotif] = useState(true);
    const userSecPosObj = useSelector(getUserSecurityInfo);
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
                let targetIndex = draft.findIndex(el=>el.orderId==newMarketOrder.orderId);
                if(targetIndex != -1){
                    draft.splice(targetIndex,1);  //remove 1st element from array
                }
            });
        }, 4000);
    }, [curTabMarketOrders]);

    return <>
    {pendingOrders.length > 0 &&
    <ToastContainer position="bottom-start" className="w-75" style={{ padding: '1rem' }}>
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
