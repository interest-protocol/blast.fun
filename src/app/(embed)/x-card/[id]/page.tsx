import XCard from "@/views/x-card";

const XCardPage = ({ params }: { params: Promise<{ id: string }> }) => <XCard params={params} />

export default XCardPage;