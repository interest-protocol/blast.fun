import { FC } from "react"

const RiskWarning: FC = () => (
    <div className="border-t border-border pt-8 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Risk Warning</h2>

        <div className="space-y-4 text-base leading-relaxed">
            <p>
                The <strong>Blast</strong> Platform and services generally involve interacting with user-generated Digital Assets in various ways.
                Neither <strong>GiveRep Labs</strong> nor any affiliates are responsible for user-generated Digital Assets that you may, in your
                sole discretion, engage with on the <strong>Blast</strong> Platform or via the services. Please ensure that you fully understand
                the risks involved before using the <strong>Blast</strong> Platform.
            </p>

            <p>
                The value of User-Generated Digital Assets, especially memecoins commonly found on the <strong>Blast</strong> Platform, can
                fluctuate significantly and there is a material risk of economic loss when buying, selling, holding, or investing in any Digital
                Asset. You should consider whether participating on the <strong>Blast</strong> Platform is suitable for you given your personal
                circumstances.
            </p>

            <p>
                We are not your broker, intermediary, agent, or advisor and we have no fiduciary obligation to you. We do not provide investment
                or consulting advice, and no communication or information from us should be construed as such. We do not recommend that any
                user-generated Digital Asset be bought, earned, sold, or held by you.
            </p>

            <p>
                You are solely responsible for determining whether any user-generated Digital Asset is appropriate for you based on your personal
                investment objectives, financial circumstances, and risk tolerance. Before making any decision to buy, sell, or hold any Digital
                Asset, you should conduct your own due diligence and consult a financial advisor where appropriate.
            </p>
        </div>
    </div>
)

export default RiskWarning
