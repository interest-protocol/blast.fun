import Header from "@/components/layout/header";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-1 flex-col h-screen">
            <Header />

            <div className="flex-1">{children}</div>
        </div>
    );
}
