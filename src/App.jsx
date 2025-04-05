import { useSelector } from 'react-redux';
import '../src/styles/appTheme.scss';
import AppThemeLoad from "./features/theme/AppThemeLoad";
import { getCurUserDetails } from './features/userDetails/userDetailsSlice';
import PaperTrading from "./pages/PaperTrading";
import UserSetupContainer from './pages/UserSetupContainer';
import TradingRoomSetupContainer from './pages/TradingRoomSetup';
import { getCurrentTheme } from './features/theme/themeSlice';
import { Container } from 'react-bootstrap';
import Header from './pages/PaperTrading/components/Header';

const APP_USER_STATES = {
  USER_LOGIN_MISSING: 'USER_LOGIN_REQUIRED',
  TRADING_ROOM_ID_MISSING: 'TRADING_ROOM_REQUIRED',
  TRADING_AVAILABLE: 'TRADING_AVAILABLE'
}

function App() {
  const curUserDetails = useSelector(getCurUserDetails);
  const currentTheme = useSelector(getCurrentTheme);
  let curAppState = APP_USER_STATES.TRADING_AVAILABLE;
  
  if(!curUserDetails.userId){
    curAppState = APP_USER_STATES.USER_LOGIN_MISSING;
  } else if(!curUserDetails.curTradingRoomId){
    curAppState = APP_USER_STATES.TRADING_ROOM_ID_MISSING;
  }
  const headerHeight = 10;
  return (
    <>
      <AppThemeLoad />
      <Container fluid className={`app-${currentTheme}-bg-root`}>
        <Container fluid style={{width:'80%'}}>
          {/** Header (TOP) */}
          <Header headerHeight={headerHeight} />

          {curAppState == APP_USER_STATES.USER_LOGIN_MISSING && <UserSetupContainer headerHeight={headerHeight} />}
          {curAppState == APP_USER_STATES.TRADING_ROOM_ID_MISSING && <TradingRoomSetupContainer headerHeight={headerHeight} />}
          {curAppState == APP_USER_STATES.TRADING_AVAILABLE && <PaperTrading headerHeight={headerHeight}/>}
        </Container>
      </Container>      
    </>
  )
}

export default App
