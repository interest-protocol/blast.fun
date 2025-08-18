import { constructMetadata } from "@/lib/metadata"
import { PortfolioContent } from "./_components/portfolio-content"

export const metadata = constructMetadata({
	title: "Portfolio",
	description: "Track your crypto portfolio and PNL"
})

export default function PortfolioPage() {
	return <PortfolioContent />
}