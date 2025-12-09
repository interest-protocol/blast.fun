import { FC } from "react"
import { TermSectionProps } from "./term-section.types"

const TermSection: FC<TermSectionProps> = ({ title, children }) => (
  <div className="border-t border-border pt-8 space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed">{children}</div>
    </div>
)

export default TermSection
