import React from "react";
import { Form, InputGroup, Stack } from "react-bootstrap";
import { LightningChargeFill } from "react-bootstrap-icons";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { useSelector } from "react-redux";
import { getCurrentTheme } from "../../../features/theme/themeSlice";
import { getCurUserDetails } from "../../../features/userDetails/userDetailsSlice";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import CopyTextIcon from "./CopyTextIcon";
import ThemeToggle from './ThemeToggle';

/**
 * Header component.
 * This component displays the header of the application, including the app name, theme toggle, and user profile icon.
 * It also shows the trading room ID if the user is in a trading room.
 * @param {number} headerHeight - Height of the header in vh.
 * @returns 
 */
const Header = ({headerHeight}) => {
    const currentTheme = useSelector(getCurrentTheme);
    const curUserDetailsInfo = useSelector(getCurUserDetails);
    const {userId, userFirstName, userLastName, userColor} = useSelector(getCurUserDetails);

    return <Stack direction="horizontal" className={`align-items-center`} gap={3} style={{height:headerHeight+"vh"}}>
            <LightningChargeFill size={ICON_SMALL_SIZE} className="text-warning" />
            <Stack direction="vertical" gap={0} className="align-self-center">
                <span className={`app-${currentTheme}-heading-color fs-1`} style={{lineHeight: '2.5rem'}}>TradeJam.io</span>
                <span>Jam & Trade with Pals.</span>
            </Stack>

            {curUserDetailsInfo.curTradingRoomId 
            && <InputGroup className="ms-auto w-25">
                <Form.Control 
                    disabled
                    value={curUserDetailsInfo.curTradingRoomId}/>
                <InputGroupText style={{cursor: 'pointer'}}>
                    <CopyTextIcon copyText={curUserDetailsInfo.curTradingRoomId}/>
                </InputGroupText>
                </InputGroup>}
            <ThemeToggle rootElClassName={`${!curUserDetailsInfo.curTradingRoomId && 'ms-auto'}`} />
            {userId && <div className={`app-initials-profile-icon app-initials-profile-icon-lg`} style={{backgroundColor: userColor}}>{userFirstName.charAt(0)+""+userLastName.charAt(0)}</div>}
          </Stack>;
};

export default Header;
