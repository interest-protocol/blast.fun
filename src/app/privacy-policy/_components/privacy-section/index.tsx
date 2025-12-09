import { FC } from "react"

import { PrivacySectionProps } from "./privacy-section.types"

const PrivacySection: FC<PrivacySectionProps> = ({ title, children }) => (
    <section className="border-t border-border pt-8 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="space-y-4 text-base leading-relaxed">
            {children}
        </div>
    </section>
)

export default PrivacySection
