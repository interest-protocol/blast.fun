import { FC } from "react"
import TermSection from "./term-section"

const Terms: FC = () => (
    <>
        <TermSection title="1. Introduction">
            <p>1.1. <strong>GiveRep Labs</strong> and its affiliates develop, maintain, operate,
                and provide access to the <strong>Blast</strong> Platform and services.
            </p>

            <p>1.2. By using the <strong>Blast</strong> Platform or services, you are entering
                into a legally binding agreement with <strong>GiveRep Labs</strong> and its affiliates.
            </p>

            <p>1.3. You must read these Terms carefully and notify us if you do not understand anything.</p>

            <p>1.4. You agree to comply with any additional terms applicable
                to your use of the <strong>Blast</strong> Platform.
            </p>
        </TermSection>

        <TermSection title="2. Eligibility">
            <p>2.1. To use the <strong>Blast</strong> Platform and services, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>a. Be an individual or entity with full authority to enter into these Terms and, if
                    an individual, be of legal age in your jurisdiction.
                </li>
                <li>b. If acting on behalf of an entity, be duly authorized to bind it.</li>
                <li>c. Not be located in or operating from any prohibited jurisdiction as per our
                    List of Prohibited Countries.
                </li>
            </ul>

            <p>2.2. We may change eligibility criteria at our sole discretion.</p>
        </TermSection>

        <TermSection title="3. Blast Platform">
            <p>3.1. Access is at our discretion; we may refuse or restrict access at any time.</p>

            <p>3.2.–3.3. You must not post, upload, or publish abusive, defamatory, dishonest, obscene,
                or market-manipulating content on the <strong>Blast</strong> Platform or elsewhere relating
                to user-generated Digital Assets.
            </p>
        </TermSection>

        <TermSection title="4. Fees and Calculations">
            <p>4.1. Fees for <strong>Blast</strong> services can be found on our official documentation.
                <strong>GiveRep Labs</strong> does not currently charge for platform access but may do so in the future.
            </p>

            <p>4.2.–4.5. You agree to pay all applicable fees and authorize deduction from your connected Wallet.
                All fee calculations are final unless there is a manifest error.
            </p>
        </TermSection>

        <TermSection title="5. Records">
            <p>We retain personal data as needed to operate the <strong>Blast</strong> Platform and comply with
                applicable law, as outlined in our Privacy Notice.
            </p>

        </TermSection>

        <TermSection title="6. Accessing the Blast Platform">
            <p>6.1.–6.2. You must have the necessary equipment and internet access. We may impose additional requirements from time to time.</p>
        </TermSection>

        <TermSection title="7. Intellectual Property Rights">
            <p>All intellectual property rights in the <strong>Blast</strong> Platform and services belong to 
                <strong>GiveRep Labs</strong> or its licensors.
            </p>
        </TermSection>

        <TermSection title="8. User Responsibilities">
            <p>You are responsible for maintaining the security of your account and wallet credentials.</p>
        </TermSection>

        <TermSection title="9. Prohibited Activities">
            <p>You may not use the Platform for illegal activities, market manipulation, or to harm others.</p>

        </TermSection>

        <TermSection title="10. Disclaimers and Warranties">
            <p>The Platform is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
        </TermSection>

        <TermSection title="11. Limitation of Liability">
            <p><strong>GiveRep Labs</strong> shall not be liable for any indirect, incidental, or consequential damages.</p>
        </TermSection>

        <TermSection title="12–25. Additional Terms">
            <p>Additional terms regarding service modifications, termination, indemnification, and other legal provisions 
                apply as standard for platforms of this nature.
            </p>
        </TermSection>

        <TermSection title="26. Governing Law">
            <p>Aside from where Applicable Law provides otherwise, these Terms (including the arbitration agreement) 
                shall be governed by, and construed in accordance with, the laws of the <strong>British Virgin Islands</strong>.
            </p>
        </TermSection>

        <TermSection title="27. Dispute Resolution; Arbitration">
            <p>The arbitration provisions from the original apply here, with proceedings in Tortola, BVI, under the BVI Arbitration Act 2013.</p>
        </TermSection>

        <TermSection title="28. Contact">
            <p>For questions or complaints, contact our Support team via our official communication channels (e.g., Telegram, email).</p>
        </TermSection>
    </>
)

export default Terms
