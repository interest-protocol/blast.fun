import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local";

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
})

const hegartySans = localFont({
    src: [
        {
            path: "../public/fonts/BBHSansHegarty-Regular.ttf",
            weight: "400",
        },
    ],
    display: "swap",
    variable: "--font-hegarty",
});

export { geistSans, geistMono, hegartySans }
