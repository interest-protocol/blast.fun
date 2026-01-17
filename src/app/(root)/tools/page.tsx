import { FC } from "react"

import Tools from "@/views/tools";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
	title: "Tools",
	description: "Token management tools for airdrops, vesting schedules, DCA strategies, and more",
})

const ToolsPage: FC = () =>  <Tools />


export default ToolsPage;