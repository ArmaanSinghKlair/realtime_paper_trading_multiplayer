import React from "react";
import { Nav, Tab } from "react-bootstrap";
import { SECURITY_SUMMARY_TAB_KEYS } from "../../../styles/constants";
import SecuritySummaryOrderTab from "./SecuritySummaryOrderTab";
import UserSecPosTable from "./UserSecPosTable";

/**
 * SecuritySummaryTab component.
 * This component renders a tabbed interface for displaying security summary information.
 * @returns {JSX.Element}
 */
const SecuritySummaryTab = () => {
  return <Tab.Container defaultActiveKey={SECURITY_SUMMARY_TAB_KEYS.POSITION} >
          <Nav variant='pills' className="pb-2 border-bottom">
              <Nav.Item>
                  <Nav.Link className='app-text-theme' eventKey={SECURITY_SUMMARY_TAB_KEYS.POSITION}>Position</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                  <Nav.Link className='app-text-theme' eventKey={SECURITY_SUMMARY_TAB_KEYS.ORDERS}>Orders</Nav.Link>
              </Nav.Item>
          </Nav>
          <Tab.Content>
              <Tab.Pane eventKey={SECURITY_SUMMARY_TAB_KEYS.POSITION}>
                <UserSecPosTable />
              </Tab.Pane>
              <Tab.Pane eventKey={SECURITY_SUMMARY_TAB_KEYS.ORDERS} className='py-2'>
                  <SecuritySummaryOrderTab />
              </Tab.Pane>
          </Tab.Content>
        </Tab.Container>;
};

export default SecuritySummaryTab;
