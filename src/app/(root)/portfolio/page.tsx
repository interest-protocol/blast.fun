import { FC } from "react";

import Portfolio from "@/views/portfolio";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
	title: "Portfolio",
	description: "Track your crypto portfolio and PNL"
})

const PortfolioPage: FC = () => {
	return <Portfolio />
}

export default PortfolioPage