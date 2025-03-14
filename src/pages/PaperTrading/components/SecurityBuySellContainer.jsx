import React, { useState } from "react";
import { Button, Col, Container, FloatingLabel, Form, InputGroup, Row, Stack, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { Calculator, CalculatorFill } from "react-bootstrap-icons";
import { ICON_SMALL_SIZE } from "../../../styles/constants";

const BUY_SELL_TAB_STATE = {
  BUY: "BUY",
  SELL: "SELL"
}
const SecurityBuySellContainer = () => {
  const [buySellTabState, setBuySellTabState] = useState(BUY_SELL_TAB_STATE.BUY);
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
                <span>2,468.11</span>

              </Stack>
              <Stack 
                className={`align-items-end py-2 px-3 rounded-end-4 ${buySellTabState==BUY_SELL_TAB_STATE.SELL ? 'text-danger bg-danger bg-opacity-25' : 'bg-body-secondary'}`} 
                onClick={()=>setBuySellTabState(BUY_SELL_TAB_STATE.SELL)}>
                <span className="fw-bold">Sell</span>
                <span>2,510.43</span>
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
            />
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
