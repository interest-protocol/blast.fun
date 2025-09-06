import { Metadata } from "next"

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Privacy Policy for Blast Platform",
}

export default function PrivacyPolicyPage() {
	return (
		<div className="container mx-auto max-w-4xl px-6 py-12">
			<div className="space-y-8">
				<div className="space-y-4">
					<h1 className="font-bold text-4xl tracking-tight">Privacy Notice</h1>

					<p className="font-medium text-lg text-muted-foreground">Last Updated: 2025-08-15</p>
				</div>

				<div className="space-y-6 text-base leading-relaxed">
					<p>
						This <strong>Privacy Notice</strong> describes the privacy practices of <strong>GiveRep Labs</strong>{" "}
						and its affiliates (collectively, &ldquo;<strong>GiveRep Labs</strong>,&rdquo; &ldquo;
						<strong>our</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>we</strong>&rdquo;)
						in connection with the websites and the <strong>Blast</strong> platform (collectively, the &ldquo;
						<strong>Services</strong>&rdquo;). It also explains the rights and choices available to individuals
						regarding their information.
					</p>

					<p>
						By accessing or using <strong>Blast</strong>, you acknowledge and agree to this Privacy Notice. If
						you do not agree, please discontinue use of the Services.
					</p>

					<p>
						We may update this Privacy Notice to reflect changes in laws, regulations, industry standards, or our
						Services. If we make changes that materially affect your privacy rights, we will take appropriate
						steps to inform you. Continued use of the Services after such changes constitutes acceptance of the
						revised Privacy Notice.
					</p>

					<p>
						The Services are not directed to individuals under the age of 18, and we do not knowingly collect
						personal data from minors. If you believe a child has provided us with information, please contact us
						so we can delete it.
					</p>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">1. Personal Data Controller</h2>

					<div className="text-base leading-relaxed">
						<p>
							&ldquo;Personal Data&rdquo; means information that can be associated with a specific person and
							can identify them. It excludes aggregated or anonymized data. For purposes of applicable law,{" "}
							<strong>GiveRep Labs</strong> acts as the Personal Data controller, meaning we determine the
							purposes and means of processing Personal Data.
						</p>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">2. Types of Personal Data Collected</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>The types of Personal Data we may collect directly or via third parties include:</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>Financial information (e.g., wallet addresses)</li>
							<li>
								Transaction information (e.g., sender and recipient wallet addresses, activities on{" "}
								<strong>Blast</strong>, inquiries and responses)
							</li>
							<li>Usage data (e.g., IP address, country, browser or OS features, interaction data)</li>
							<li>
								Other identification or commercial information required for compliance with applicable
								anti-money laundering (AML) laws
							</li>
						</ul>

						<p>
							We may also collect Personal Data from publicly available sources or third parties. Unless
							specified otherwise, requested Personal Data is mandatory to access the Services.
						</p>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">3. Information Collected Automatically</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>
							When you visit <strong>Blast</strong>, we may automatically collect:
						</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>Device/browser information (IP, domain, IMEI, OS, browser version, time zone)</li>
							<li>Interaction data (pages viewed, referring websites, search terms, click patterns)</li>
							<li>Location data, where applicable</li>
						</ul>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">4. Cookies & Similar Technologies</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>
							We use cookies and similar technologies (&ldquo;Cookies&rdquo;) to enable core functionality,
							improve performance, and analyze usage. Cookies may be:
						</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>
								<strong>Strictly Necessary</strong> – Essential for Service operation
							</li>
							<li>
								<strong>Functionality</strong> – Remembering preferences and settings
							</li>
							<li>
								<strong>Performance/Analytical</strong> – Understanding usage patterns
							</li>
							<li>
								<strong>Targeting</strong> – Delivering relevant content
							</li>
						</ul>

						<p>
							You can control or delete Cookies via browser/device settings, but some features may not function
							properly if disabled.
						</p>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">5. Methods & Legal Basis of Processing</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>
							We take appropriate security measures to prevent unauthorized access, disclosure, alteration, or
							destruction of Personal Data.
						</p>

						<p>Processing may be based on:</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>Your consent</li>
							<li>Contractual necessity</li>
							<li>Legal obligations</li>
							<li>Legitimate interests pursued by us or third parties</li>
						</ul>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">6. How We Use Personal Data</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>We may use Personal Data to:</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>
								Provide and operate <strong>Blast</strong>
							</li>
							<li>Process transactions</li>
							<li>Detect fraudulent or malicious activity</li>
							<li>Monitor and analyze user behavior</li>
							<li>Beta test features</li>
							<li>Contact you</li>
							<li>Authenticate your account</li>
							<li>Comply with legal obligations</li>
							<li>Protect our rights and the rights of others</li>
						</ul>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">7. How We Share Personal Data</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>We may share Personal Data:</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>
								Within <strong>GiveRep Labs</strong> and affiliates
							</li>
							<li>With service providers/vendors acting on our behalf</li>
							<li>As required by law or regulatory authorities</li>
							<li>In connection with a business transaction (e.g., merger, acquisition)</li>
						</ul>

						<p className="font-medium">We do not sell Personal Data to third parties.</p>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">8. Retention of Personal Data</h2>

					<div className="text-base leading-relaxed">
						<p>
							We retain Personal Data as long as necessary for the purposes collected, including legal and
							regulatory compliance. Once no longer needed, data will be deleted or anonymized, except for data
							recorded on public blockchains, which cannot be altered.
						</p>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">9. Privacy Technology Practices</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<ul className="list-disc space-y-2 pl-6">
							<li>
								<strong>Links to Third Parties:</strong> We are not responsible for the privacy practices of
								third-party websites or services linked to <strong>Blast</strong>.
							</li>
							<li>
								<strong>Data Security:</strong> We employ administrative, technical, and physical safeguards,
								but cannot guarantee absolute security.
							</li>
							<li>
								<strong>Blockchain Transactions:</strong> Transactions may be recorded on public blockchains,
								which are immutable and not controlled by <strong>GiveRep Labs</strong>.
							</li>
						</ul>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">10. International Transfers & Your Rights</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>
							Personal Data may be transferred internationally, including to jurisdictions outside your
							residence. Transfers will comply with applicable data protection laws.
						</p>

						<p>If you reside in the EEA or UK, you have rights to:</p>

						<ul className="list-disc space-y-2 pl-6">
							<li>Access, correct, or delete your data</li>
							<li>Restrict or object to processing</li>
							<li>Receive data in portable format</li>
							<li>Withdraw consent at any time</li>
						</ul>
					</div>
				</div>

				<div className="space-y-6 border-border border-t pt-8">
					<h2 className="font-semibold text-2xl tracking-tight">11. Exercising Your Rights & Complaints</h2>

					<div className="space-y-4 text-base leading-relaxed">
						<p>
							To exercise rights or submit complaints, contact <strong>GiveRep Labs</strong> Support with
							sufficient identifying information and your request details. We will investigate and respond as
							required by law. You may also contact your local data protection authority.
						</p>

						<div className="mt-6 rounded-lg bg-secondary p-4">
							<p className="mb-2 font-medium">Contact:</p>
							<p>
								GiveRep Labs
								<br />
								support@giverep.com
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
