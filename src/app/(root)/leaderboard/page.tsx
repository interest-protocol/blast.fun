import { FC, Suspense } from "react";

import Leaderboard from "@/views/leaderboard";

const LeaderboardPage: FC = () => (
    <Suspense fallback={null}>
        <Leaderboard />
    </Suspense>
);

export default LeaderboardPage;