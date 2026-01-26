import { TokenSortOption } from "@/types/token";

export interface SortBySelectorProps {
    value: TokenSortOption;
    onChange: (v: TokenSortOption) => void;
}