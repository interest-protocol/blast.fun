import { Metadata } from "next"
import { BASE_DOMAIN, siteConfig } from "@/constants"

export function constructMetadata({
	title = siteConfig.name,
	description = siteConfig.description,
	image = siteConfig.image,
	icons = {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	noIndex = false,
	openGraph,
	twitter,
}: {
	title?: string
	description?: string
	image?: string
	icons?: Metadata["icons"]
	noIndex?: boolean
	openGraph?: Metadata["openGraph"]
	twitter?: Metadata["twitter"]
} = {}): Metadata {
	return {
		title,
		description,
		applicationName: siteConfig.name,
		publisher: siteConfig.name,
		openGraph: openGraph || {
			type: "website",
			url: siteConfig.url,
			title,
			description,
			siteName: siteConfig.name,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					type: "image/png",
				},
			],
		},
		twitter: twitter || {
			card: "summary_large_image",
			title,
			description,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					type: "image/png",
					alt: title,
				},
			],
			creator: "@blastdotfun",
		},
		icons,
		metadataBase: new URL(BASE_DOMAIN),
		...(noIndex && {
			robots: {
				index: false,
				follow: false,
			},
		}),
	}
}
