import React from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";
import { SECURITY_ORDER_TAB_KEY, SECURITY_SUMMARY_TAB_KEYS } from "../../../styles/constants";
import SecurityOrderTable from "./SecurityOrderTable";

const SecuritySummaryOrderTab = () => {
  return <Tab.Container defaultActiveKey={SECURITY_ORDER_TAB_KEY.ALL.key}>
  <Row>
      <Col>
        <Nav variant="pills">
            {
                Object.keys(SECURITY_ORDER_TAB_KEY).map((key, index)=>{
                    return (
                        <Nav.Item key={key}>
                            <Nav.Link eventKey={SECURITY_ORDER_TAB_KEY[key].key}>{SECURITY_ORDER_TAB_KEY[key].tabTitle}</Nav.Link>
                        </Nav.Item>
                    )
                })
            }
        </Nav>
      </Col>
      
  </Row>
  <Row>
      <Col>
          <Tab.Content>
          {
                Object.keys(SECURITY_ORDER_TAB_KEY).map((key, index)=>{
                    return (
                        <Tab.Pane key={key} eventKey={SECURITY_ORDER_TAB_KEY[key].key} className="pt-2">
                            <SecurityOrderTable />
                        </Tab.Pane>
                    )
                })
            }
          </Tab.Content>
      </Col>
  </Row>
</Tab.Container>;
};

export default SecuritySummaryOrderTab;
