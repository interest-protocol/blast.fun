import { BASE_DOMAIN, siteConfig } from "@/constants";
import { Metadata } from "next";

export function constructMetadata({
    title = siteConfig.name,
    description = siteConfig.description,
    image = siteConfig.image,
    icons = {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png'
    },
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    icons?: Metadata['icons'];
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title,
        description,
        applicationName: siteConfig.name,
        publisher: siteConfig.name,
        openGraph: {
            type: 'website',
            url: siteConfig.url,
            title,
            description,
            siteName: siteConfig.name,
            images: [
                {
                    url: image,
                    width: 150,
                    height: 150,
                    type: 'image/png'
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [{
                url: image,
                width: 1200,
                height: 600,
                type: 'image/png',
                alt: title
            }],
            creator: siteConfig.links.twitter
        },
        icons,
        metadataBase: new URL(BASE_DOMAIN),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false
            }
        }),
    }
}