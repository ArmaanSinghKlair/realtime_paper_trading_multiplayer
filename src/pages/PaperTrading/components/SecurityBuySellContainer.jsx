import React, { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row, Stack } from "react-bootstrap";
import { CalculatorFill } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";

const BUY_SELL_TAB_STATE = {
  BUY: "BUY",
  SELL: "SELL"
}
const SecurityBuySellContainer = () => {
  const userSecPosObj = useSelector(getUserSecurityInfo);
  const [units, setUnits] = useState(0);
  const [unitError, setUnitError] = useState(null);
  const [buySellTabState, setBuySellTabState] = useState(BUY_SELL_TAB_STATE.BUY);

  const handleUnitChange = (val) =>{
    if(val < userSecPosObj.curSecurityDetails.minTradeableValue){
      setUnitError(`Specified value is less than the instrument minimum of ${userSecPosObj.curSecurityDetails.minTradeableValue}`)
    } else{
      setUnitError(null);
    }
    setUnits(val);
  }
  // const [uni]
  return <>
          <Stack direction='horizontal' className="mb-3" gap={3}>
                  <CalculatorFill style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
                  <span className='app-card-title'>ETHUSD, Paper Trading</span>
              </Stack>
          <Container fluid>
            <Stack direction="horizontal" className="cursor-pointer mb-3">
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
          <InputGroup size="" className="mb-4 mt-0">
            <Form.Control
              aria-label="Units"
              id="securityUnits"
              value={units}
              onChange={(el)=>{handleUnitChange(el.value)}}
              type='number'
            />
            <Form.Control.Feedback type="invalid">
              {unitError}
            </Form.Control.Feedback>
            <Form.Control
              aria-label="USD"
              id="securityUsd"
            />
          </InputGroup>
          <Button variant={`${buySellTabState == BUY_SELL_TAB_STATE.BUY ? 'primary' : 'danger'}`} className={`w-100 rounded-4`}>
            <Stack>
              <span className="fw-bold">{buySellTabState == BUY_SELL_TAB_STATE.BUY ? 'Buy': 'Sell'}</span>
              <span className="app-fs-sm">1.5 ETHUSD MKT</span>
            </Stack>
          </Button>
        </Container>
  </>;
};

export default SecurityBuySellContainer;
