import React from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";
import { SECURITY_SUMMARY_TAB_KEYS } from "../../../styles/constants";
import SecuritySummaryOrderTab from "./SecuritySummaryOrderTab";

const SecuritySummaryTab = () => {
  return <Tab.Container defaultActiveKey={SECURITY_SUMMARY_TAB_KEYS.POSITION} >
  <Row>
      <Col>
          <Nav variant='tabs'>
              <Nav.Item>
                  <Nav.Link className='app-text-theme' eventKey={SECURITY_SUMMARY_TAB_KEYS.POSITION}>Position</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                  <Nav.Link className='app-text-theme' eventKey={SECURITY_SUMMARY_TAB_KEYS.ORDERS}>Orders</Nav.Link>
              </Nav.Item>
          </Nav>
      </Col>
      
  </Row>
  <Row>
      <Col>
          <Tab.Content>
              <Tab.Pane eventKey={SECURITY_SUMMARY_TAB_KEYS.POSITION}>First tab content</Tab.Pane>
              <Tab.Pane eventKey={SECURITY_SUMMARY_TAB_KEYS.ORDERS} className='py-2'>
                  <SecuritySummaryOrderTab />
              </Tab.Pane>
          </Tab.Content>
      </Col>
  </Row>
</Tab.Container>;
};

export default SecuritySummaryTab;
