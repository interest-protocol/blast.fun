export default async function CoinPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="flex flex-col gap-2">
            <h1>{id} pool page</h1>
        </div>
    );
}