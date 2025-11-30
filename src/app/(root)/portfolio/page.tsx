import { constructMetadata } from "@/lib/metadata"
import { FC } from "react"
import PortfolioContent from "./_components/portfolio-content"

export const metadata = constructMetadata({
	title: "Portfolio",
	description: "Track your crypto portfolio and PNL"
})

const PortfolioPage:FC = () => <PortfolioContent />

export default PortfolioPage