import React, { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row, Stack } from "react-bootstrap";
import { CalculatorFill } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";
import { buySecurityAsync, getTradingRoomInfo, sellSecurityAsync } from "../../../features/tradingRoomInfo/tradingRoomInfoSlice";
import { getCurUserDetails } from "../../../features/userDetails/userDetailsSlice";
import { addCurUserMarketOrder, getTradingSecurityInfo } from "../../../features/tradingSecurityInfo/tradingSecurityInfoSlice";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import { UserMarketOrder, UserSecPosUtils } from "../../../utils/candlestickChart";

const BUY_SELL_TAB_STATE = {
  BUY: "BUY",
  SELL: "SELL"
}

/**
 * SecurityBuySellContainer component.
 * This component handles the buy/sell functionality for the security in the trading room.
 * It allows users to enter the number of units they want to buy/sell and displays the current price.
 * It also validates the input and shows an error message if the specified value is less than the instrument minimum.
 * @returns 
 */
const SecurityBuySellContainer = () => {
  const userSecPosObj = useSelector(getTradingSecurityInfo);
  const tradingRoomInfo = useSelector(getTradingRoomInfo);

  const curUserDetails = useSelector(getCurUserDetails);
  const curSecurityDetails = tradingRoomInfo?.userSecurityPos[curUserDetails?.userId];
  const [errMsg, setErrMsg] = useState(null);
  const [units, setUnits] = useState(1);
  const [buySellTabState, setBuySellTabState] = useState(BUY_SELL_TAB_STATE.BUY);
  const storeDispatch = useDispatch();
  /**
   * Handles unit field value change
   * @param {*} val 
   */
  const handleUnitChange = (val) =>{
    val = parseFloat(val);
    if(val && val < userSecPosObj.curSecurityDetails.minTradeableValue){
      setErrMsg(`Specified value is less than the instrument minimum of ${userSecPosObj.curSecurityDetails.minTradeableValue}`)
    } else{
      setErrMsg(null);
    }
    setUnits(val);
  }

  /**
   * Handles Buy/Sell Button click
   */
  const handleSecTrans = () =>{
    let isBuyOrder = buySellTabState == BUY_SELL_TAB_STATE.BUY ;
    let marketOrder = new UserMarketOrder(units, userSecPosObj.latestSecurityPrice, curUserDetails.userId, isBuyOrder ? UserMarketOrder.ORDER_SIDE_TYPE.BUY : UserMarketOrder.ORDER_SIDE_TYPE.SELL);
    let tradeValue = units * userSecPosObj.latestSecurityPrice;
    
    let availableFundsForTrade = curSecurityDetails.availableFunds;
    //if long position, we can still sell that position to makeup for funds
    if((isBuyOrder && curSecurityDetails.ownedQuantity < 0)
      || (!isBuyOrder && curSecurityDetails.ownedQuantity > 0)){
      availableFundsForTrade += UserSecPosUtils.getUserSecMarketValue(curSecurityDetails, userSecPosObj.latestSecurityPrice);
    }
    
    if(tradeValue > availableFundsForTrade){
      marketOrder.status = UserMarketOrder.ORDER_STATUS_TYPE.REJECTED;
    } else {
      if(isBuyOrder){
        storeDispatch(buySecurityAsync(JSON.parse(JSON.stringify(marketOrder))));
      } else {
        storeDispatch(sellSecurityAsync(JSON.parse(JSON.stringify(marketOrder))));
      }
    }
    storeDispatch(addCurUserMarketOrder(JSON.parse(JSON.stringify(marketOrder)))); 
    //reset units text field to 1 units after saving
    handleUnitChange(1);
  }

  return <>
          <Stack direction='horizontal' className="mb-3" gap={3}>
              <CalculatorFill style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
              <span className='app-card-title'>ETHUSD, Paper Trading</span>
          </Stack>
          <Container fluid>
            <Stack direction="horizontal" className="cursor-pointer mb-2">
              <Stack 
                className={`py-2 px-3 rounded-start-4 ${buySellTabState==BUY_SELL_TAB_STATE.BUY ? 'text-primary bg-primary bg-opacity-25' : 'bg-body-secondary'}`}
                onClick={()=>setBuySellTabState(BUY_SELL_TAB_STATE.BUY)}>

                <span className="fw-bold">Buy</span>
                <PriceNumberFormatter>{userSecPosObj.latestSecurityPrice}</PriceNumberFormatter>

              </Stack>
              <Stack 
                className={`align-items-end py-2 px-3 rounded-end-4 ${buySellTabState==BUY_SELL_TAB_STATE.SELL ? 'text-danger bg-danger bg-opacity-25' : 'bg-body-secondary'}`} 
                onClick={()=>setBuySellTabState(BUY_SELL_TAB_STATE.SELL)}>
                <span className="fw-bold">Sell</span>
                <PriceNumberFormatter>{userSecPosObj.latestSecurityPrice}</PriceNumberFormatter>
              </Stack>
            </Stack>

          <Row>
            <Col><Form.Label htmlFor="securityUnits" className="m-0">Units</Form.Label></Col>
            <Col><Form.Label htmlFor="securityUsd" className="m-0">USD</Form.Label></Col>
          </Row>
          <InputGroup size="" className="mb-0 mt-0">
            <Form.Control
              aria-label="Units"
              id="securityUnits"
              value={units}
              onChange={(e)=>{handleUnitChange(e.target.value)}}
              type='number'
            />
            <Form.Control
              aria-label="USD"
              id="securityUsd"
              disabled
              value={(units*userSecPosObj.latestSecurityPrice).toFixed(2)}
            />
          </InputGroup>
          {errMsg && <div className="text-danger p-0 m-0 app-fs-sm">{errMsg}</div>}

          <Button variant={`${buySellTabState == BUY_SELL_TAB_STATE.BUY ? 'primary' : 'danger'}`} className={`w-100 rounded-4 ${errMsg ? 'mt-0': 'mt-4'}`} disabled={!units || errMsg} onClick={handleSecTrans}>
            <Stack>
            <span className="fw-bold">{buySellTabState == BUY_SELL_TAB_STATE.BUY ? 'Buy': 'Sell'}</span>
              {!units || errMsg
              ? 
              <span className="app-fs-sm">Invalid units specified</span>
              :             
              <span className="app-fs-sm">{units} ETHUSD MKT</span>
              }
              
            </Stack>
          </Button>
        </Container>
  </>;
};

export default SecurityBuySellContainer;
