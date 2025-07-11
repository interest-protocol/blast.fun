import Header from "@/components/layout/header";
import { Ticker } from "@/components/shared/ticker";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // @todo: we will fetch last 10 or so transactions and show on ticker "[twitterAvatar] @opiateful has bought 5 SUI of {token} [tokenImg?]"

    return (
        <div className="flex flex-1 flex-col h-screen">
            <Ticker />
            <Header />

            <div className="flex-1">{children}</div>
        </div>
    );
}
