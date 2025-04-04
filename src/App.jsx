import { useSelector } from 'react-redux';
import '../src/styles/appTheme.scss';
import AppThemeLoad from "./features/theme/AppThemeLoad";
import { getCurUserDetails } from './features/userDetails/userDetailsSlice';
import PaperTrading from "./pages/PaperTrading";
import UserSetupContainer from './pages/UserSetupContainer';
import { getCurrentTheme } from './features/theme/themeSlice';
import { Container } from 'react-bootstrap';
import Header from './pages/PaperTrading/components/Header';

function App() {
  const curUserDetails = useSelector(getCurUserDetails);
  const currentTheme = useSelector(getCurrentTheme);

  const headerHeight = 10;
  return (
    <>
      <AppThemeLoad />
      <Container fluid className={`app-${currentTheme}-bg-root`}>
        <Container fluid style={{width:'80%'}}>
          {/** Header (TOP) */}
          <Header headerHeight={headerHeight} />

          {curUserDetails.userId 
            ? 
            <PaperTrading headerHeight={headerHeight}/>
            : 
            <UserSetupContainer headerHeight={headerHeight} />
          }
        </Container>
      </Container>      
    </>
  )
}

export default App
