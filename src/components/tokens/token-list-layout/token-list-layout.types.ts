import { ReactNode } from "react"

export interface TokenListLayoutProps {
    title: string
    children: ReactNode
    className?: string
    headerClassName?: string
    scrollClassName?: string
    glowColor?: "blue" | "pink" | "gold"
    headerAction?: ReactNode
}