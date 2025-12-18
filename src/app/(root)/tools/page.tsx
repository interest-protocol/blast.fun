import { FC } from "react"

import { constructMetadata } from "@/lib/metadata"
import ToolsContent from "./_components/tool-content"

export const metadata = constructMetadata({
	title: "Tools",
	description: "Token management tools for airdrops, vesting schedules, DCA strategies, and more",
})

const ToolsPage: FC = () => {
	return <ToolsContent />
}

export default ToolsPage;