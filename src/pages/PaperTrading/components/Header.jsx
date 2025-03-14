import React from "react";
import { Stack } from "react-bootstrap";
import { LightningChargeFill } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { ICON_SMALL_SIZE } from "../../../styles/constants";
import { getCurrentTheme } from "../../../features/theme/themeSlice";
import ThemeToggle from './ThemeToggle';

const Header = ({headerHeight}) => {
    const currentTheme = useSelector(getCurrentTheme);
    const {userFirstName, userLastName, userColor} = useSelector(state => state.userDetails);

    return <Stack direction="horizontal" className={`align-items-center`} gap={3} style={{height:headerHeight+"vh"}}>
            <LightningChargeFill size={ICON_SMALL_SIZE} className="text-warning" />
            <Stack direction="vertical" gap={0} className="align-self-center">
                <span className={`app-${currentTheme}-heading-color fs-1`} style={{lineHeight: '2.5rem'}}>TradeJam.io</span>
                <span>Jam & Trade with Pals.</span>
            </Stack>

            <ThemeToggle rootElClassName="ms-auto" />
            <div className={`app-initials-profile-icon app-initials-profile-icon-lg`} style={{backgroundColor: userColor}}>{userFirstName.charAt(0)+""+userLastName.charAt(0)}</div>
          </Stack>;
};

export default Header;
