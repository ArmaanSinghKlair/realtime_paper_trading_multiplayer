import React, { Fragment } from 'react';
import { Stack } from 'react-bootstrap';
import { Activity, InfoCircleFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { RedGreenText } from '../../../components/common/RedGreenText';
import TooltipText from '../../../components/common/TooltipText';
import { getCurrentTheme } from '../../../features/theme/themeSlice';
import { ICON_SMALL_SIZE } from '../../../styles/constants';
import SecuritySummaryTab from './SecuritySummaryTab';
import PriceNumberFormatter from '../../../components/common/PriceNumberFormattter';
import { getUserSecurityInfo } from '../../../features/userSecurityInfo/userSecurityInfoSlice';
import { UserSecPosUtils, UserSecurityPosition } from '../../../utils/candlestickChart';

export const UserSecurityPosContainer = () => {
    const {userFirstName, userLastName, userColor} = useSelector(state => state.userDetails);
    const currentTheme = useSelector(getCurrentTheme);
    const userSecPosObj = useSelector(getUserSecurityInfo);
    const curSecurityDetails = userSecPosObj?.userSecurityPos[userSecPosObj?.curUserId];

    return <>
    <Stack direction='horizontal' >
        <Stack direction='horizontal' className='align-self-start app-card-title' gap={2}>
            <Activity style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            <span style={{color: userColor}} className='fw-medium'>{userFirstName} {userLastName}</span>
        </Stack>

        {/** User account summary */}
        <Stack direction='horizontal' className='ms-auto' gap={3}>
            <Stack>
                <span className='app-fs-sm fw-bold'>Account Balance</span>
                <span>
                {curSecurityDetails ? <PriceNumberFormatter>{curSecurityDetails.accountBalance }</PriceNumberFormatter> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='app-fs-sm fw-bold'>Equity</span>
                <span>
                    {curSecurityDetails ? <PriceNumberFormatter>{curSecurityDetails.ownedQuantity}</PriceNumberFormatter> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='app-fs-sm fw-bold'>Realized P&L</span>
                <span>
                    {curSecurityDetails ? <RedGreenText valNum={curSecurityDetails.realizedPL}><PriceNumberFormatter>{curSecurityDetails.realizedPL}</PriceNumberFormatter></RedGreenText> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='app-fs-sm fw-bold'>Unrealized P&L</span>
                <span>
                    {curSecurityDetails ? <RedGreenText valNum={curSecurityDetails.unrealizedPL}><PriceNumberFormatter>{curSecurityDetails.unrealizedPL}</PriceNumberFormatter></RedGreenText> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='app-fs-sm fw-bold'>Available Funds <TooltipText title={'Funds you can trade with'}><InfoCircleFill /></TooltipText></span>
                <span>
                    {curSecurityDetails ? <PriceNumberFormatter>{curSecurityDetails.accountBalance }</PriceNumberFormatter> : '-'}
                </span>
            </Stack>           
        </Stack>
    </Stack>

    {/** Security position summary and trading history */}
    <SecuritySummaryTab />
    </>;
}
