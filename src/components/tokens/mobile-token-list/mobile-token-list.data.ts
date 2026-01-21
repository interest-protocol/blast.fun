import { TabData } from "./mobile-token-list.types";

export const TABS: TabData[] = [
    {
        key: "new",
        label: "NEW",
        pollInterval: 10000
    },
    {
        key: "graduating",
        label: "BONDING",
        pollInterval: 10000
    },
    {
        key: "graduated",
        label: "BONDED",
        pollInterval: 30000
    }
]