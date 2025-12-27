import toast from "react-hot-toast";
import { WalletCoin } from "@/types/blockvision";

export const fetchWalletCoins = async (
  memezWalletAddress: string,
  setWalletCoins: (coins: WalletCoin[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  if (!memezWalletAddress) return;

  setIsLoading(true);
  try {
    const response = await fetch("/api/wallet/coins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: memezWalletAddress }),
    });
    if (!response.ok) throw new Error("Failed to fetch wallet coins");
    const data = await response.json();
    setWalletCoins(data.coins || []);
  } catch (error) {
    console.error("Error fetching wallet coins:", error);
    toast.error("Failed to load wallet funds");
    setWalletCoins([]);
  } finally {
    setIsLoading(false);
  }
};