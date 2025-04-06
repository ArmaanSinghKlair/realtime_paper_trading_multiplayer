import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { v4 } from "uuid";

/**
 * Display tooltip when hover over text.
 * @param {*} param0 
 * @returns 
 */
const TooltipText = ({children, title }) => {
    return (
        <OverlayTrigger  
            overlay={<Tooltip key={title} id={v4()}>{title}</Tooltip>}>
            {children}
        </OverlayTrigger>
    )
};

export default TooltipText;
