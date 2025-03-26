import { UserMarketOrder } from "../utils/candlestickChart";

export const ICON_SMALL_SIZE = '1.5rem';
export const ICON_MEDIUM_SIZE = '2.5rem';

/**
 * Keys for tabs in account level tabs for user security summary tabs
 */
export const SECURITY_SUMMARY_TAB_KEYS = {
    POSITION: "POSITION",
    ORDERS: "ORDERS"
}

export const SECURITY_ORDER_TAB_KEY = {
    ALL: {
        key: UserMarketOrder.ORDER_STATUS_TYPE.ALL,
        title: "All"
    },
    // WORKING: {
    //     key: UserMarketOrder.ORDER_STATUS_TYPE.WORKING,
    //     title: "Working"
    // },
    // INACTIVE: {
    //     key: UserMarketOrder.ORDER_STATUS_TYPE.INACTIVE,
    //     title: "Inactive"
    // },
    FILLED: {
        key: UserMarketOrder.ORDER_STATUS_TYPE.FILLED,
        title: "Filled"
    },
    // CANCELLED: {
    //     key: UserMarketOrder.ORDER_STATUS_TYPE.CANCELLED,
    //     title: "Cancelled"
    // },
    REJECTED: {
        key: UserMarketOrder.ORDER_STATUS_TYPE.REJECTED,
        title: "Rejected"
    },
}