import React, { Fragment } from 'react';
import { Stack } from 'react-bootstrap';
import { Activity, InfoCircleFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { RedGreenText } from '../../../components/common/RedGreenText';
import TooltipText from '../../../components/common/TooltipText';
import { getCurrentTheme } from '../../../features/theme/themeSlice';
import { ICON_SMALL_SIZE } from '../../../styles/constants';
import SecuritySummaryTab from './SecuritySummaryTab';

export const UserSecurityPosContainer = () => {
    const {userFirstName, userLastName, userColor} = useSelector(state => state.userDetails);
    const currentTheme = useSelector(getCurrentTheme);

    const accountSummaryContentItems = [
        {
            itemTitle: 'Account Balance',
            itemValue: 94178.39,
        },
        {
            itemTitle: 'Equity',
            itemValue: 94179.67
        },
        {
            itemTitle: 'Realized P&L',
            itemValue: -5821.61,
            requireColor: true
        },
        {
            itemTitle: 'Unrealized P&L',
            itemValue: 0.18,
            requireColor: true
        },
        {
            itemTitle: 'Available funds',
            itemValue: 94179.67,
            itemHelp: 'Funds you can trade with'
        }
    ];
    return <>
    <Stack direction='horizontal' >
        <Stack direction='horizontal' className='align-self-start app-card-title' gap={2}>
            <Activity style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            <span style={{color: userColor}} className='fw-medium'>{userFirstName} {userLastName}</span>
        </Stack>

        {/** User account summary */}
        <Stack direction='horizontal' className='ms-auto' gap={3}>
            {
                accountSummaryContentItems.map((item, index)=> {
                    return <Fragment key={index}>
                        <Stack>
                            <span className='app-fs-sm fw-bold'>{item.itemTitle} {item.itemHelp && <TooltipText title={item.itemHelp}><InfoCircleFill /></TooltipText>}</span>
                            <span>
                                {
                                item.requireColor 
                                ? <RedGreenText valNum={item.itemValue}>{item.itemValue}</RedGreenText>
                                : item.itemValue
                                }
                            </span>
                        </Stack>
                        {index < accountSummaryContentItems.length-1 && <div className='vr'></div>}
                    </Fragment>
                })
            }            
        </Stack>
    </Stack>

    {/** Security position summary and trading history */}
    <SecuritySummaryTab />
    </>;
}
