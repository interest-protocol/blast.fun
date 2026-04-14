import dynamic from "next/dynamic";
import DiscoveryLoading from "./discovery-loading";

const DiscoveryContent = dynamic(() => import("./discovery-content"), {
	loading: () => <DiscoveryLoading />,
});

const Discovery = () => <DiscoveryContent />;

export default Discovery;
