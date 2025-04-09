import React, { Fragment, useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { dequeTradingRoomNotification, getTradingRoomNotifications } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";
import TradingRoomNotificationItem from "./TradingRoomNotificationItem";

/**
 * TradingRoomNotificationContainer component.
 * This component is responsible for displaying notifications for trading room events.
 * It uses the useImmer hook to manage the state of notifications.
 * The component listens for changes in the trading room notifications and updates the notification accordingly.
 * @param {*} param0 
 * @returns 
 */
const TradingRoomNotificationContainer = ({notificationTitle='Notifications'}) => {
    const [showNotif, setShowNotif] = useState(true);
    const storeDispatch = useDispatch();
    let tradingRoomNotifs = useSelector(getTradingRoomNotifications);

    //Runs when market order added
    useEffect(()=>{
        if(!tradingRoomNotifs || tradingRoomNotifs.length==0){
            return;
        }
        setShowNotif(true);

        // Clear this notification after sometime also
        let notifTimeout = setTimeout(()=>{
            storeDispatch(dequeTradingRoomNotification());
        }, 4000);

        return ()=>{
            clearTimeout(notifTimeout);
            setShowNotif(false);
        }
    }, [tradingRoomNotifs]);

    return <>
    {tradingRoomNotifs.length > 0 &&
    <ToastContainer position="bottom-end" className="" style={{ padding: '1rem' }}>
        <Toast show={showNotif} onClose={()=>setShowNotif(!showNotif)} delay={2000}>
            <Toast.Header>
            <strong className="me-auto">{notificationTitle}</strong>
            </Toast.Header>
            <Toast.Body>
                {tradingRoomNotifs.map((wsPayload, index)=>{
                    return (
                    <Fragment key={wsPayload.createSubscriberSocketId +"-"+ wsPayload.createTimeUtcMs}>
                        <TradingRoomNotificationItem wsPayload={wsPayload} />
                        {index < tradingRoomNotifs.length-1 && <hr />}
                    </Fragment>
                    )
                })}
            </Toast.Body>
        </Toast>
    </ToastContainer>
    }
    </>;
};

export default TradingRoomNotificationContainer;
