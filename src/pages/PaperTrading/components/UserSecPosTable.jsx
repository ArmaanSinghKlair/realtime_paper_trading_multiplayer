import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";
import QuantityNumberFormattter from "../../../components/common/QuantityNumberFormattter";
import { RedGreenText } from "../../../components/common/RedGreenText";
import { getGroupUserInfo } from "../../../features/groupUserInfo/groupUserInfoSlice";
import { getCurUserDetails } from "../../../features/userDetails/userDetailsSlice";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import { UserSecPosUtils } from "../../../utils/candlestickChart";

const UserSecPosTable = () => {
    const userSecPosObj = useSelector(getUserSecurityInfo);
    const groupUsersInfo = useSelector(getGroupUserInfo);
    const curUserDetails = useSelector(getCurUserDetails);
    let secPosTableContent = null;
    
    if(curUserDetails.userId && groupUsersInfo?.userSecurityPos[curUserDetails.userId] && groupUsersInfo?.userSecurityPos[curUserDetails.userId]?.ownedQuantity != 0){
        let curSecurityDetails = groupUsersInfo?.userSecurityPos[curUserDetails.userId];
        secPosTableContent =  (
        <tr>
            <td>{userSecPosObj.curSecurityDetails.symbol}</td>
            <td className={curSecurityDetails.ownedQuantity < 0 ? 'text-danger': 'text-primary'}>{curSecurityDetails.ownedQuantity < 0 ? 'Short' : 'Long'}</td>
            <td><QuantityNumberFormattter>{curSecurityDetails.ownedQuantity}</QuantityNumberFormattter></td>
            <td><PriceNumberFormatter>{UserSecPosUtils.getAvgFillPrice(curSecurityDetails)}</PriceNumberFormatter></td>
            <td><PriceNumberFormatter>{userSecPosObj.latestSecurityPrice}</PriceNumberFormatter></td>
            <td><RedGreenText valNum={curSecurityDetails.unrealizedPL}><PriceNumberFormatter>{curSecurityDetails.unrealizedPL}</PriceNumberFormatter> <span className='app-fs-sm'>USD</span></RedGreenText></td>
            <td><PriceNumberFormatter>{UserSecPosUtils.getUserSecMarketValue(curSecurityDetails, userSecPosObj.latestSecurityPrice)}</PriceNumberFormatter> <span className='app-fs-sm'>USD</span></td>
            <td><PriceNumberFormatter>{UserSecPosUtils.getUserSecMarketValue(curSecurityDetails, userSecPosObj.latestSecurityPrice)}</PriceNumberFormatter> <span className='app-fs-sm'>USD</span></td>
        </tr>);
    } else{
        secPosTableContent = <tr><td className="border-0 text-center" colSpan={100}>There are no open positions in your trading account yet.</td></tr>
    }
    return <Table hover className="app-table my-0">
    <thead>
        <tr>
            <th>Symbol</th>
            <th>Side</th>
            <th>Qty</th>
            <th>Avg Fill Price</th>
            <th>Last Price</th>
            <th>Unrealized P&L</th>
            <th>Trade Value</th>
            <th>Market Value</th>
        </tr>
    </thead>
    <tbody>
        {secPosTableContent}
    </tbody>
    </Table>;
};

export default UserSecPosTable;
