import { RoomList } from "./_components/room-list"

export default function StreamPage() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Live Streams</h1>
				<p className="text-muted-foreground mt-2">
					Join existing streams or create your own
				</p>
			</div>
			<RoomList />
		</div>
	)
}