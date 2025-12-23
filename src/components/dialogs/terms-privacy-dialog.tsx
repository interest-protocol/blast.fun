"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { needsTermsUpdate } from "@/utils/version"

const TERMS_VERSION_KEY = "blast-terms-version"
const CURRENT_TERMS_VERSION = "1.0.0"

const TermsPrivacyDialog = () => {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const [isUpdate, setIsUpdate] = useState(false)

	useEffect(() => {
		const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '')
		const excludedPaths = ['/term-of-service', '/privacy-policy']

		if (excludedPaths.includes(currentPath)) {
			return
		}

		const acceptedVersion = localStorage.getItem(TERMS_VERSION_KEY)

		if (needsTermsUpdate(acceptedVersion, CURRENT_TERMS_VERSION)) {
			setOpen(true)
			setIsUpdate(!!acceptedVersion)
		}
	}, [pathname])

	const handleAccept = () => {
		localStorage.setItem(TERMS_VERSION_KEY, CURRENT_TERMS_VERSION)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={() => { }}>
			<DialogContent
				className="gap-0 p-0 sm:max-h-[min(600px,80vh)] sm:max-w-md"
				onPointerDownOutside={(e) => e.preventDefault()}
				showCloseButton={false}
			>
				<DialogHeader className="contents space-y-0 text-left">
					<DialogTitle className="border-b px-6 py-4">
						{isUpdate ? "Terms Updated" : "Terms and Conditions"}
					</DialogTitle>

					<div className="overflow-y-auto px-6 py-4 text-sm text-muted-foreground">
						<ol className="flex list-decimal flex-col gap-2 pl-4">
							<li>
								<strong className="text-primary">Risk Warning:</strong>
								Digital assets and memecoins can fluctuate significantly. There is material risk of economic loss.
								We provide no investment advice or fiduciary obligation.
							</li>
							<li>
								<strong className="text-primary">Eligibility:</strong>
								You must be of legal age in your jurisdiction and not located in any prohibited country.
							</li>
							<li>
								<strong className="text-primary">Account Security:</strong>
								You are solely responsible for maintaining the security of your wallet credentials and account.
							</li>
							<li>
								<strong className="text-primary">Prohibited Activities:</strong>
								Do not use the platform for illegal activities, market manipulation, or to post abusive,
								defamatory, or dishonest content.
							</li>
							<li>
								<strong className="text-primary">Platform Fees:</strong>
								You agree to pay all applicable fees. Fee calculations are final unless there is a manifest error.
							</li>
						</ol>

						<p className="mt-3">
							For full details, please read our complete{' '}
							<Link
								href="/term-of-service"
								target="_blank"
								className="text-sky-600 hover:underline dark:text-sky-400"
							>
								Terms of Service
							</Link>
							{' '}and{' '}
							<Link
								href="/privacy-policy"
								target="_blank"
								className="text-sky-600 hover:underline dark:text-sky-400"
							>
								Privacy Policy
							</Link>
						</p>
					</div>

					<DialogFooter className="px-6 pb-4 sm:justify-end">
						<Button onClick={handleAccept} type="button">
							I Agree
						</Button>
					</DialogFooter>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

export default TermsPrivacyDialog;