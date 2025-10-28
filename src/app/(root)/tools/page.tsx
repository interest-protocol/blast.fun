import { constructMetadata } from "@/lib/metadata"
import ToolsContent from "./_components/tool-content"

export const metadata = constructMetadata({
	title: "Tools",
	description: "Token management tools for airdrops, vesting schedules, DCA strategies, and more",
})

export default function ToolsPage() {
	return <ToolsContent />
}