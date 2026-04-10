import type { Token } from "@lifi/sdk";
import { create } from "zustand";
import { DEFAULT_SLIPPAGE } from "@/lib/env";
import { getOtherSupportedChainId, SUPPORTED_CHAIN_IDS } from "@/lib/chains";
import type { RoutePreference } from "@/types/bridge";

type BridgeStore = {
  amount: string;
  fromChainId: number;
  routePreference: RoutePreference;
  selectedToken?: Token;
  setAmount: (amount: string) => void;
  setFromChainId: (chainId: number) => void;
  setRoutePreference: (routePreference: RoutePreference) => void;
  setSelectedToken: (token: Token | undefined) => void;
  setSlippage: (slippage: number) => void;
  setToChainId: (chainId: number) => void;
  slippage: number;
  toChainId: number;
};

export const useBridgeStore = create<BridgeStore>((set) => ({
  amount: "",
  fromChainId: SUPPORTED_CHAIN_IDS[0],
  routePreference: "CHEAPEST",
  selectedToken: undefined,
  setAmount: (amount) => set({ amount }),
  setFromChainId: (chainId) =>
    set((state) => ({
      fromChainId: chainId,
      selectedToken: state.fromChainId === chainId ? state.selectedToken : undefined,
      toChainId: state.toChainId === chainId ? getOtherSupportedChainId(chainId) : state.toChainId,
    })),
  setRoutePreference: (routePreference) => set({ routePreference }),
  setSelectedToken: (selectedToken) => set({ selectedToken }),
  setSlippage: (slippage) => set({ slippage }),
  setToChainId: (chainId) =>
    set((state) => ({
      fromChainId: state.fromChainId === chainId ? getOtherSupportedChainId(chainId) : state.fromChainId,
      toChainId: chainId,
    })),
  slippage: DEFAULT_SLIPPAGE,
  toChainId: SUPPORTED_CHAIN_IDS[1],
}));
