import { FC } from "react"

const IntroductionAndAcceptance: FC = () => (
    <div className="space-y-6 text-base leading-relaxed">
        <p>
            These Terms of Use constitute a legally binding agreement between you (&ldquo;<strong>you</strong>&rdquo; or &ldquo;<strong>your</strong>&rdquo;)
            and <strong>GiveRep Labs</strong> (&ldquo;<strong>Blast</strong>&rdquo;, &ldquo;<strong>Entities or affiliates</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;,
            &ldquo;<strong>our</strong>&rdquo; or &ldquo;<strong>us</strong>&rdquo;). The Terms govern your use of all <strong>Blast</strong> services made available
            to you on or through the <strong>Blast</strong> Platform or otherwise. <strong>Blast</strong> services may be developed, maintained,
            and/or provided by <strong>GiveRep Labs</strong> or its affiliates.
        </p>

        <p>
            By accessing the <strong>Blast</strong> Platform and/or using the <strong>Blast</strong> services, as defined in these Terms,
            you agree that you have read, understood, and accepted these Terms, together with any additional documents. You acknowledge
            and agree that you will be bound by and will comply with these Terms, as updated and amended from time to time.
        </p>

        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="font-bold uppercase text-sm">
                BY ACCESSING THE BLAST PLATFORM AND USING BLAST SERVICES, YOU IRREVOCABLY WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION
                OR SIMILAR MASS ACTION IN ANY JURISDICTION OR BEFORE ANY TRIBUNAL AS STATED IN SECTION 28. YOU ALSO EXPRESSLY AGREE THAT ANY
                CLAIMS AGAINST ANY BLAST-RELATED ENTITY OR AFFILIATE WILL BE SUBJECT TO MANDATORY, BINDING ARBITRATION AS STATED IN SECTION 27.
            </p>
        </div>

        <p>
            If you do not understand and accept these Terms in their entirety, you should not use the <strong>Blast</strong> Platform.
        </p>
    </div>
)

export default IntroductionAndAcceptance
