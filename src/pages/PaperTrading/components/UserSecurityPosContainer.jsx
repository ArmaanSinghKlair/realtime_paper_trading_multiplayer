import React from 'react';
import { Stack } from 'react-bootstrap';
import { Activity, InfoCircleFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import PriceNumberFormatter from '../../../components/common/PriceNumberFormattter';
import { RedGreenText } from '../../../components/common/RedGreenText';
import TooltipText from '../../../components/common/TooltipText';
import { getTradingRoomInfo } from '../../../features/tradingRoomInfo/tradingRoomInfoSlice';
import { getCurUserDetails } from '../../../features/userDetails/userDetailsSlice';
import { ICON_SMALL_SIZE } from '../../../styles/constants';
import { UserSecPosUtils } from '../../../utils/candlestickChart';
import SecuritySummaryTab from './SecuritySummaryTab';

/**
 * UserSecurityPosContainer component.
 * This component displays the user's current security positions and account summary.
 * It shows the account balance, equity, realized P&L, unrealized P&L, and available funds.
 * It also displays the user's name and trading activity icon.
 * @returns 
 */
export const UserSecurityPosContainer = () => {
    const {userFirstName, userLastName, userColor} = useSelector(state => state.userDetails);
    const curUserDetails = useSelector(getCurUserDetails);
    const tradingRoomInfo = useSelector(getTradingRoomInfo);

    const curSecurityDetails = tradingRoomInfo?.userSecurityPos[curUserDetails?.userId];

    return <>
    <Stack direction='horizontal' className='mb-2'>
        <Stack direction='horizontal' className='align-self-start app-card-title' gap={2}>
            <Activity style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            <span style={{color: userColor}} className='fw-medium'>{userFirstName} {userLastName}</span>
        </Stack>

        {/** User account summary */}
        <Stack direction='horizontal' className='ms-auto app-fs-sm' gap={3}>
            <Stack>
                <span className='fw-bold'>Account Balance</span>
                <span>
                {curSecurityDetails ? <PriceNumberFormatter>{curSecurityDetails.accountBalance}</PriceNumberFormatter> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='fw-bold'>Equity</span>
                <span>
                    {curSecurityDetails ? <PriceNumberFormatter>{UserSecPosUtils.getUserSecEquity(curSecurityDetails)}</PriceNumberFormatter> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='fw-bold'>Realized P&L</span>
                <span>
                    {curSecurityDetails ? <RedGreenText valNum={curSecurityDetails.realizedPL}><PriceNumberFormatter>{curSecurityDetails.realizedPL}</PriceNumberFormatter></RedGreenText> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='fw-bold'>Unrealized P&L</span>
                <span>
                    {curSecurityDetails ? <RedGreenText valNum={curSecurityDetails.unrealizedPL}><PriceNumberFormatter>{curSecurityDetails.unrealizedPL}</PriceNumberFormatter></RedGreenText> : '-'}
                </span>
            </Stack>
            <div className='vr'></div>

            <Stack>
                <span className='fw-bold'>Available Funds <TooltipText title={'Funds you can trade with'}><InfoCircleFill /></TooltipText></span>
                <span>
                    {curSecurityDetails ? <PriceNumberFormatter>{curSecurityDetails.availableFunds}</PriceNumberFormatter> : '-'}
                </span>
            </Stack>           
        </Stack>
    </Stack>

    {/** Security position summary and trading history */}
    <SecuritySummaryTab />
    </>;
}
