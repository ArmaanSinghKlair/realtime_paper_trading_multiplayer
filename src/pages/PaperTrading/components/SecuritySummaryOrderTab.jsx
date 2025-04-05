import React from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";
import { SECURITY_ORDER_TAB_KEY } from "../../../styles/constants";
import SecurityOrderTable from "./SecurityOrderTable";

const SecuritySummaryOrderTab = () => {
  return <Tab.Container defaultActiveKey={SECURITY_ORDER_TAB_KEY.ALL.key}>
            <Nav variant="pills">
                {
                    Object.keys(SECURITY_ORDER_TAB_KEY).map((key, index)=>{
                        return (
                            <Nav.Item key={key}>
                                <Nav.Link eventKey={SECURITY_ORDER_TAB_KEY[key].key}>{SECURITY_ORDER_TAB_KEY[key].title}</Nav.Link>
                            </Nav.Item>
                        )
                    })
                }
            </Nav>
            <Tab.Content>
            {
                    Object.keys(SECURITY_ORDER_TAB_KEY).map((key, index)=>{
                        return (
                            <Tab.Pane key={key} eventKey={SECURITY_ORDER_TAB_KEY[key].key} className="pt-2">
                                <SecurityOrderTable orderStatus={SECURITY_ORDER_TAB_KEY[key].key} />
                            </Tab.Pane>
                        )
                    })
                }
            </Tab.Content>
         </Tab.Container>;
};

export default SecuritySummaryOrderTab;
