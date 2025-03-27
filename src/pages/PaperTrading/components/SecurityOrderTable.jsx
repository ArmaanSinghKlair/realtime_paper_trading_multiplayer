import React from "react";
import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import { SECURITY_ORDER_TAB_KEY } from "../../../styles/constants";
import { UserMarketOrder } from "../../../utils/candlestickChart";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";

const SecurityOrderTable = ({orderStatus}) => {
  const userSecPosObj = useSelector(getUserSecurityInfo);
  let curTabMarketOrders = userSecPosObj.curUserMarketOrders.filter((el)=>el.status==orderStatus || orderStatus == UserMarketOrder.ORDER_STATUS_TYPE.ALL);
  
  let orderTableRows = null;
  if(curTabMarketOrders.length > 0){
    orderTableRows = curTabMarketOrders.map((order)=>{
      let isBuyOrder = order.orderSide == UserMarketOrder.ORDER_SIDE_TYPE.BUY;
      return <tr>
              <td>{userSecPosObj.curSecurityDetails.symbol}</td>
              <td className={isBuyOrder ? 'text-primary': 'text-danger'}>{isBuyOrder ? 'Buy' : 'Sell'}</td>
              <td><PriceNumberFormatter>{order.quantity}</PriceNumberFormatter></td>
              <td><PriceNumberFormatter>{order.price}</PriceNumberFormatter></td>
              <td className={order.status == UserMarketOrder.ORDER_STATUS_TYPE.REJECTED ? 'text-danger': 'text-success'}>{SECURITY_ORDER_TAB_KEY[order.status].title}</td>
              <td>{new Date(order.placeTime).toISOString()}</td>
              <td>{order.orderId}</td>
              </tr>;
    })
  } else{
    orderTableRows = <tr><td className="border-0 text-center" colSpan={100}>There is no trading data here yet.</td></tr>;
  }
  return <Table hover className="app-table my-0">
  <thead>
    <tr>
      <th>Symbol</th>
      <th>Side</th>
      <th>Qty</th>
      <th>Fill Price</th>
      <th>Status</th>
      <th>Placing Time</th>
      <th>Order ID</th>
    </tr>
  </thead>
  <tbody>
    {orderTableRows}
  </tbody>
</Table>;
};

export default SecurityOrderTable;
