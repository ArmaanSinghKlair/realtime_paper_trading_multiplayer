import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { getUserSecurityInfo } from "../../../features/userSecurityInfo/userSecurityInfoSlice";
import { RedGreenText } from "../../../components/common/RedGreenText";
import { UserSecPosUtils } from "../../../utils/candlestickChart";
import PriceNumberFormatter from "../../../components/common/PriceNumberFormattter";

const UserSecPosTable = () => {
    const userSecPosObj = useSelector(getUserSecurityInfo);

    let secPosTableContent = null;
    
    if(userSecPosObj?.curUserId && userSecPosObj?.userSecurityPos[userSecPosObj?.curUserId] && userSecPosObj?.userSecurityPos[userSecPosObj?.curUserId]?.ownedQuantity != 0){
        let curSecurityDetails = userSecPosObj?.userSecurityPos[userSecPosObj?.curUserId];
        secPosTableContent =  (<tbody>
        <tr>
            <td>{userSecPosObj.curSecurityDetails.symbol}</td>
            <td className={curSecurityDetails.ownedQuantity < 0 ? 'text-danger': 'text-primary'}>{curSecurityDetails.ownedQuantity < 0 ? 'Short' : 'Long'}</td>
            <td><PriceNumberFormatter>{curSecurityDetails.ownedQuantity}</PriceNumberFormatter></td>
            <td><PriceNumberFormatter>{UserSecPosUtils.getAvgFillPrice(curSecurityDetails)}</PriceNumberFormatter></td>
            <td><PriceNumberFormatter>{userSecPosObj.latestSecurityPrice}</PriceNumberFormatter></td>
            <td><RedGreenText valNum={curSecurityDetails.unrealizedPL}><PriceNumberFormatter>{curSecurityDetails.unrealizedPL}</PriceNumberFormatter> <span className='app-fs-sm'>USD</span></RedGreenText></td>
            <td><PriceNumberFormatter>{Math.abs(curSecurityDetails.ownedQuantity) * userSecPosObj.latestSecurityPrice}</PriceNumberFormatter> <span className='app-fs-sm'>USD</span></td>
            <td><PriceNumberFormatter>{UserSecPosUtils.getUserSecMarketValue(curSecurityDetails, userSecPosObj.latestSecurityPrice)}</PriceNumberFormatter> <span className='app-fs-sm'>USD</span></td>
        </tr>
        </tbody>);
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
    {secPosTableContent}
    </Table>;
};

export default UserSecPosTable;
