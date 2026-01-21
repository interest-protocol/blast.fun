export type TabType = "new" | "graduating" | "graduated"

export interface TabData {
    key: TabType
    label: string
    pollInterval: number
}