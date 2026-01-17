import { FC } from "react"
import PrivacySection from "./privacy-section"

const Privacy: FC = () => (
    <>
        <PrivacySection title="1. Personal Data Controller">
            <p>
                “Personal Data” means information that can be associated with a specific person and
                can identify them. It excludes aggregated or anonymized data. For purposes of applicable
                law, <strong>GiveRep Labs</strong> acts as the Personal Data controller, meaning we
                determine the purposes and means of processing Personal Data.
            </p>
        </PrivacySection>

        <PrivacySection title="2. Types of Personal Data Collected">
            <p>The types of Personal Data we may collect directly or via third parties include:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Financial information (e.g., wallet addresses)</li>
                <li>Transaction information (e.g., sender and recipient wallet addresses, activities on 
                    <strong> Blast</strong>, inquiries and responses)
                </li>
                <li>Usage data (e.g., IP address, country, browser or OS features, interaction data)</li>
                <li>Other identification or commercial information required for compliance with AML laws</li>
            </ul>

            <p>
                We may also collect Personal Data from publicly available sources or third parties.
                Unless specified otherwise, requested Personal Data is mandatory to access the Services.
            </p>
        </PrivacySection>

        <PrivacySection title="3. Information Collected Automatically">
            <p>When you visit <strong>Blast</strong>, we may automatically collect:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Device/browser information (IP, domain, IMEI, OS, browser version, time zone)</li>
                <li>Interaction data (pages viewed, referring websites, search terms, click patterns)</li>
                <li>Location data, where applicable</li>
            </ul>
        </PrivacySection>

        <PrivacySection title="4. Cookies & Similar Technologies">
            <p>
                We use cookies and similar technologies (“Cookies”) to enable core functionality,
                improve performance, and analyze usage. Cookies may be:
            </p>

            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Strictly Necessary</strong> – Essential for Service operation</li>
                <li><strong>Functionality</strong> – Remembering preferences and settings</li>
                <li><strong>Performance/Analytical</strong> – Understanding usage patterns</li>
                <li><strong>Targeting</strong> – Delivering relevant content</li>
            </ul>

            <p>
                You can control or delete Cookies via browser/device settings, but some features
                may not function properly if disabled.
            </p>
        </PrivacySection>

        <PrivacySection title="5. Methods & Legal Basis of Processing">
            <p>
                We take appropriate security measures to prevent unauthorized access, disclosure,
                alteration, or destruction of Personal Data.
            </p>

            <p>Processing may be based on:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Your consent</li>
                <li>Contractual necessity</li>
                <li>Legal obligations</li>
                <li>Legitimate interests pursued by us or third parties</li>
            </ul>
        </PrivacySection>

        <PrivacySection title="6. How We Use Personal Data">
            <p>We may use Personal Data to:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Provide and operate <strong>Blast</strong></li>
                <li>Process transactions</li>
                <li>Detect fraudulent or malicious activity</li>
                <li>Monitor and analyze user behavior</li>
                <li>Beta test features</li>
                <li>Contact you</li>
                <li>Authenticate your account</li>
                <li>Comply with legal obligations</li>
                <li>Protect our rights and the rights of others</li>
            </ul>
        </PrivacySection>

        <PrivacySection title="7. How We Share Personal Data">
            <p>We may share Personal Data:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Within <strong>GiveRep Labs</strong> and affiliates</li>
                <li>With service providers/vendors acting on our behalf</li>
                <li>As required by law or regulatory authorities</li>
                <li>In connection with a business transaction (e.g., merger, acquisition)</li>
            </ul>

            <p className="font-medium">We do not sell Personal Data to third parties.</p>
        </PrivacySection>

        <PrivacySection title="8. Retention of Personal Data">
            <p>
                We retain Personal Data as long as necessary for the purposes collected, including
                legal and regulatory compliance. Once no longer needed, data will be deleted or
                anonymized, except for data recorded on public blockchains, which cannot be altered.
            </p>
        </PrivacySection>

        <PrivacySection title="9. Privacy Technology Practices">
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Links to Third Parties:</strong> We are not responsible for the privacy practices of
                    third-party websites or services linked to <strong>Blast</strong>.
                </li>
                <li><strong>Data Security:</strong> We employ administrative, technical, and physical safeguards,
                    but cannot guarantee absolute security.
                </li>
                <li><strong>Blockchain Transactions:</strong> Transactions may be recorded on public blockchains,
                    which are immutable and not controlled by <strong>GiveRep Labs</strong>.
                </li>
            </ul>
        </PrivacySection>

        <PrivacySection title="10. International Transfers & Your Rights">
            <p>
                Personal Data may be transferred internationally, including to jurisdictions outside
                your residence. Transfers will comply with applicable data protection laws.
            </p>

            <p>If you reside in the EEA or UK, you have rights to:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete your data</li>
                <li>Restrict or object to processing</li>
                <li>Receive data in portable format</li>
                <li>Withdraw consent at any time</li>
            </ul>
        </PrivacySection>

        <PrivacySection title="11. Exercising Your Rights & Complaints">
            <p>
                To exercise rights or submit complaints, contact <strong>GiveRep Labs</strong> Support
                with sufficient identifying information and your request details. We will investigate
                and respond as required by law. You may also contact your local data protection authority.
            </p>

            <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="font-medium mb-2">Contact:</p>
                <p>
                    GiveRep Labs<br />
                    support@giverep.com
                </p>
            </div>
        </PrivacySection>
    </>
)

export default Privacy
