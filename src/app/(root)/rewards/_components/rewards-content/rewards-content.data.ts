import CreatorRewardsTab from "../creator-rewards-tab";

export const REWARDS_TABS = [
    {
        name: "Rewards",
        value: "rewards",
        component: null,
        enabled: false,
    },
    {
        name: "Leaderboard",
        value: "leaderboard",
        component: null,
        enabled: false,
    },
    {
        name: "Creator Rewards",
        value: "creator-rewards",
        component: CreatorRewardsTab,
        enabled: true,
    },
]