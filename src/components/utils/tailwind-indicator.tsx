import { FC } from "react";

const TailwindIndicator: FC = () => {
	if (process.env.NODE_ENV === "production") return null

	return (
		<div className="fixed bottom-1 right-1 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white p-2 font-mono text-xs text-black">
			<div className="block sm:hidden">xs</div>
			<div className="hidden sm:block md:hidden">sm</div>
			<div className="hidden md:block lg:hidden">md</div>
			<div className="hidden lg:block xl:hidden">lg</div>
			<div className="hidden xl:block 2xl:hidden">xl</div>
			<div className="hidden 2xl:block">2xl</div>
		</div>
	);
}

export default TailwindIndicator;
