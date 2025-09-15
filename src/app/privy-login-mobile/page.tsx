import React, { Suspense } from "react"
import PrivyLoginMobileModule from "./_components/privy-login-mobile-module"

export async function generateMetadata() {
	return {
		title: "BLAST.FUN - Privy Login",
		description: "Login with your social accounts to access BLAST.FUN",
	}
}

const PrivyLoginMobilePage = () => {
	return (
		<Suspense>
			<PrivyLoginMobileModule />
		</Suspense>
	)
}

export default PrivyLoginMobilePage