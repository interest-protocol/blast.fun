import toast from "react-hot-toast";
import { walletSdk } from "@/lib/memez/sdk";

export const fetchMemezWallet = async (
  address: string,
  setMemezWalletAddress: (addr: string) => void
) => {
  try {
    const memezAddr = await walletSdk.getWalletAddress(address);
    console.log("Rewards wallet address:", memezAddr);
    setMemezWalletAddress(memezAddr!);
  } catch (error) {
    console.error("Failed to get reward wallet address:", error);
    toast.error("Failed to get reward wallet address");
  }
};