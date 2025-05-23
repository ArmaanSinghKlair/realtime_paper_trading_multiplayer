import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { createRandomString } from "../../utils/genericUtils";

/**
 * Display tooltip when hover over text.
 * @param {*} param0 
 * @returns 
 */
const TooltipText = ({children, title }) => {
    return (
        <OverlayTrigger  
            overlay={<Tooltip key={title} id={createRandomString()}>{title}</Tooltip>}>
            {children}
        </OverlayTrigger>
    )
};

export default TooltipText;
