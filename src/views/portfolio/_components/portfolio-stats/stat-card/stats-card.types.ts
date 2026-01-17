import { PropsWithChildren, ReactNode } from "react"

export interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: string
  description?: string
  className?: string
}
