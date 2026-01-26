import { TokenListSettings, TokenSortOption } from "@/types/token"

export interface TokenListFiltersProps {
    columnId: string;
    onSettingsChange: (settings: TokenListSettings) => void;
    defaultSort?: TokenSortOption;
    defaultTab?: 'newly-created' | 'about-to-bond' | 'bonded';
}