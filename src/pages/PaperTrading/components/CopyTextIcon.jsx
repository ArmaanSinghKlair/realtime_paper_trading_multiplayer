import React, { useState } from "react";
import TooltipText from "../../../components/common/TooltipText";
import { Copy } from "react-bootstrap-icons";

const CopyTextIcon = ({tooltipText = 'Copy Trading ID to clipboard.', copyText}) => {
    const [titleText, setTitleText] = useState(tooltipText);

    const copyIconOnClick = ()=>{
        navigator.clipboard.writeText(copyText);
        setTitleText('Copied!');
        //set back to default text after 1 sec
        setTimeout(() => {
            setTitleText(tooltipText);
        }, 1000);
    }
    return <TooltipText title={titleText}><Copy onClick={copyIconOnClick}/></TooltipText>;
};

export default CopyTextIcon;
