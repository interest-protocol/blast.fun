import "@/app/globals.css"
import "@/app/animations.css"

import type { Metadata } from "next"
import { GoogleAnalytics } from '@next/third-parties/google'
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { ReactScan } from "@/components/utils/react-scan"
import { TailwindIndicator } from "@/components/utils/tailwind-indicator"
import { TwitterAuthProvider } from "@/context/twitter.context"
import { geistMono, geistSans } from "@/fonts"
import { ApolloProvider } from "@/providers/apollo-provider"
import SuiProvider from "@/providers/sui-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { cn } from "@/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig } from "@/constants"
import { TermsPrivacyDialog } from "@/components/dialogs/terms-privacy-dialog"

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<ReactScan />
			<body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
				<ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
					<TooltipProvider>
						<SessionProvider>
							<TwitterAuthProvider>
								<ApolloProvider>
									<SuiProvider>
										{children}
										<TermsPrivacyDialog />

										<TailwindIndicator />
										<Toaster
											position="bottom-center"
											reverseOrder={true}
											toastOptions={{
												style: {
													backgroundColor: "var(--card)",
													color: "var(--foreground)",
													padding: "12px 12px",
													border: "1px solid var(--border)",
												},
											}}
										/>
									</SuiProvider>
								</ApolloProvider>
							</TwitterAuthProvider>
						</SessionProvider>
					</TooltipProvider>
				</ThemeProvider>
			</body>

			{process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
				<GoogleAnalytics gaId="G-LFECSPQX7J" />
			)}
		</html>
	)
}
