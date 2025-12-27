import { WalletCoin } from "@/types/blockvision";

export interface TableProps {
  coins: WalletCoin[];
  isLoading: boolean;
  claimingCoinType: string | null;
  onClaim: (coin: WalletCoin) => void;
}