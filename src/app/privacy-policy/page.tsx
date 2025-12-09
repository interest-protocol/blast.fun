import { FC } from "react"
import { Metadata } from "next"

import Privacy from "./_components/privacy"
import Introduction from "./_components/indroduction"

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Privacy Policy for Blast Platform",
}

const PrivacyPolicyPage: FC = () =>{
	return (
		<div className="container mx-auto max-w-4xl px-6 py-12">
			<div className="space-y-8">
				<div className="space-y-4">
					<h1 className="text-4xl font-bold tracking-tight">Privacy Notice</h1>
					
					<p className="text-lg text-muted-foreground font-medium">Last Updated: 2025-08-15</p>
				</div>
				
				<Introduction/>
				<Privacy />
			</div>
		</div>
	)
}

export default PrivacyPolicyPage