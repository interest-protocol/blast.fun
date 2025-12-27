import { WalletCoin } from "@/types/blockvision";

export interface TableRowProps {
  coin: WalletCoin;
  isClaiming: boolean;
  onClaim: () => void;
}