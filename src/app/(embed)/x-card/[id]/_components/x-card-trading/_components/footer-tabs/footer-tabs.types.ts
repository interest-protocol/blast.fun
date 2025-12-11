export interface FooterTabsProps {
    activeTab: "trade" | "chart"
    setActiveTab: (tab: "trade" | "chart") => void
}