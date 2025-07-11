import Header from "@/components/layout/header";
import { Ticker } from "@/components/shared/ticker";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // @todo: we will fetch last 10 or so transactions and show on ticker "[twitterAvatar] @opiateful has bought 5 SUI of {token} [tokenImg?]"

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Ticker items={['matical has bought 5 SUI of PumpCoin', 'matical has sold 28.224 SUI of PumpCoin', 'test has created PumpCoin']} />
            <Header />

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
            </main>
        </div>
    );
}
