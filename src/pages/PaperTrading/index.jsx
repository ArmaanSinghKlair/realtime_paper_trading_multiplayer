import { Col, Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { getCurrentTheme } from "../../features/theme/themeSlice";
import ChartContainer from "./components/ChartContainer";
import GroupChatContainer from "./components/GroupChatContainer";
import Header from "./components/Header";
import SecurityBuySellContainer from "./components/SecurityBuySellContainer";
import { UserSecurityPosContainer } from "./components/UserSecurityPosContainer";

const PaperTrading = () => {
  const currentTheme = useSelector(getCurrentTheme);
  const headerHeight = 10;
  const bodyHeight = 100-headerHeight;

  const chartContainerHeightPer = 60;
  const userSecurityPosContainerPer = 100-chartContainerHeightPer;
  const buySellPanelHeightPer = 40;
  const chatPanelHeightPer = 100-buySellPanelHeightPer;
  return <>
    <Container fluid className={`app-${currentTheme}-bg-root`}>
      <Container fluid className="w-75">
        {/** Header (TOP) */}
        <Header headerHeight={headerHeight} />

        {/** Entire Body below header */}
        <Container fluid style={{height:bodyHeight+"vh"}} className="py-1">
          <Row className={"h-100"}>

            {/** LEFT section of body */}
            <Col md={8} className="h-100 py-0 px-2 m-0">
              <Row className={"h-100"}> 
                {/** Chart Container (LEFT TOP) */}
                <Col xs={12} style={{height: chartContainerHeightPer+"%"}} className="py-2">
                  <Container fluid className={`h-100 app-card rounded-4`}>
                    <ChartContainer />
                  </Container>
                </Col>

                {/** Cur User Security Pos (LEFT BOTTOM) */}
                <Col xs={12} style={{height: userSecurityPosContainerPer+"%"}} className="py-2">
                  <Container fluid className={`h-100 bg-body-secondary bg-opacity-50 app-card rounded-4 overflow-auto`}>
                    <UserSecurityPosContainer />
                  </Container>
                </Col>
              </Row>
            </Col>

            {/** RIGHT Section */}
            <Col md={4} className="h-100 py-0 px-2 m-0">
              <Row className={"h-100"}> 
                {/** Buy Sell (LEFT TOP) */}
                <Col xs={12} style={{height: buySellPanelHeightPer+"%"}} className="py-2">
                  <Container  fluid className={`h-100 bg-body-secondary bg-opacity-50 app-card rounded-4`}>
                    <SecurityBuySellContainer />
                  </Container>
                </Col>

                {/** Group Chat (LEFT BOTTOM) */}
                <Col xs={12} style={{height: chatPanelHeightPer+"%"}} className="py-2">
                  <Container fluid className={`h-100 bg-body-secondary bg-opacity-50 app-card rounded-4`}>
                    <GroupChatContainer />
                  </Container>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </Container>
    </Container>
  </>;
};

export default PaperTrading;
