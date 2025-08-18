"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { needsTermsUpdate } from "@/utils/version"

const TERMS_VERSION_KEY = "blast-terms-version"
// Update this version number when terms/privacy policy changes
// Format: MAJOR.MINOR.PATCH (e.g., 1.0.0 -> 1.0.1 for minor updates, 2.0.0 for major changes)
const CURRENT_TERMS_VERSION = "1.0.0"

export function TermsPrivacyDialog() {
	const [open, setOpen] = useState(false)
	const [agreed, setAgreed] = useState(false)
	const [isUpdate, setIsUpdate] = useState(false)

	useEffect(() => {
		// Check if user has accepted the current version of terms
		const acceptedVersion = localStorage.getItem(TERMS_VERSION_KEY)
		
		// Use semantic version comparison
		if (needsTermsUpdate(acceptedVersion, CURRENT_TERMS_VERSION)) {
			setOpen(true)
			setIsUpdate(!!acceptedVersion) // It's an update if there was a previous version
		}
	}, [])

	const handleAccept = () => {
		if (agreed) {
			localStorage.setItem(TERMS_VERSION_KEY, CURRENT_TERMS_VERSION)
			setOpen(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>{isUpdate ? "Terms Updated" : "Welcome to Blast"}</DialogTitle>
					<DialogDescription className="pt-3 space-y-3">
						{isUpdate ? (
							<>
								<p>
									Our Terms of Service and Privacy Policy have been updated. 
									Please review and accept the new terms to continue using Blast.
								</p>
								<p className="text-sm text-muted-foreground">
									Version: {CURRENT_TERMS_VERSION}
								</p>
							</>
						) : (
							<>
								<p>
									Before you continue, please review and accept our Terms of Service and Privacy Policy.
								</p>
								<p className="text-sm">
									These documents outline important information about your rights and responsibilities 
									when using the Blast platform.
								</p>
							</>
						)}
					</DialogDescription>
				</DialogHeader>
				
				<div className="py-4 space-y-4">
					<div className="flex gap-2">
						<Link 
							href="/term-of-service" 
							target="_blank"
							className="flex-1 text-center px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-sm font-medium"
						>
							Terms of Service
						</Link>
						<Link 
							href="/privacy-policy" 
							target="_blank"
							className="flex-1 text-center px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-sm font-medium"
						>
							Privacy Policy
						</Link>
					</div>
					
					<div className="flex items-start space-x-2">
						<Checkbox 
							id="terms-agreement"
							checked={agreed}
							onCheckedChange={(checked) => setAgreed(checked as boolean)}
						/>
						<label 
							htmlFor="terms-agreement" 
							className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
						>
							I have read and agree to the Terms of Service and Privacy Policy
						</label>
					</div>
				</div>
				
				<DialogFooter>
					<Button 
						onClick={handleAccept}
						disabled={!agreed}
						className="w-full"
						size="lg"
					>
						Ready to Blast 🚀
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}