import { TokenFilters, TokenSortOption } from "@/types/token";

type TabType = 'newly-created' | 'about-to-bond' | 'bonded';

export interface TokenListFiltersDialogProps {
    tabType: TabType;
    setTabType: (v: TabType) => void;
    sortBy: TokenSortOption;
    setSortBy: (v: TokenSortOption) => void;
    filters: TokenFilters;
    setFilters: React.Dispatch<React.SetStateAction<TokenFilters>>;
    selectedSubMenu: 'audit' | 'metrics';
    setSelectedSubMenu: (v: 'audit' | 'metrics') => void;
    onApply: () => void;
    onReset: () => void;
    defaultTab: TabType;
}
