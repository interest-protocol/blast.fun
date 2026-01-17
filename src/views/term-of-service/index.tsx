import { FC } from "react";

import Terms from "./_components/terms";
import RiskWarning from "./_components/risk-warning";
import IntroductionAndAcceptance from "./_components/introduction-and-acceptance";

const TermsOfService: FC = () => {
	return (
		<div className="container mx-auto max-w-4xl px-6 py-12">
			<div className="space-y-8">
				<div className="space-y-4">
					<h1 className="text-4xl font-bold tracking-tight">Terms of Use</h1>

					<p className="text-lg text-muted-foreground font-medium">Last Updated: 2025-08-15</p>
				</div>

				<IntroductionAndAcceptance />
				<RiskWarning />
				<Terms/>
				
				<div className="border-t border-border pt-8 space-y-6">
					<h2 className="text-2xl font-semibold tracking-tight">29–31. General Terms & Definitions</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>The same as in the original Terms, except that:</p>

						<ul className="list-disc pl-6 space-y-2">
							<li><strong>Blast</strong>: The platform and services provided by <strong>GiveRep Labs</strong>.</li>
							<li><strong>GiveRep Labs</strong>: The BVI entity that owns and operates <strong>Blast</strong>.</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
export default TermsOfService;