import { arbitrum, avalanche, base, bsc, mainnet, polygon } from "viem/chains";

export type SupportedChain = {
  id: number;
  name: string;
  shortName: string;
  nativeSymbol: string;
  explorerUrl: string;
};

export const supportedWagmiChains = [mainnet, bsc, polygon, base, arbitrum, avalanche] as const;

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: mainnet.id,
    name: "Ethereum",
    shortName: "ETH",
    nativeSymbol: "ETH",
    explorerUrl: "https://etherscan.io",
  },
  {
    id: bsc.id,
    name: "BNB Chain",
    shortName: "BNB",
    nativeSymbol: "BNB",
    explorerUrl: "https://bscscan.com",
  },
  {
    id: polygon.id,
    name: "Polygon",
    shortName: "POL",
    nativeSymbol: "POL",
    explorerUrl: "https://polygonscan.com",
  },
  {
    id: base.id,
    name: "Base",
    shortName: "BASE",
    nativeSymbol: "ETH",
    explorerUrl: "https://basescan.org",
  },
  {
    id: arbitrum.id,
    name: "Arbitrum",
    shortName: "ARB",
    nativeSymbol: "ETH",
    explorerUrl: "https://arbiscan.io",
  },
  {
    id: avalanche.id,
    name: "Avalanche",
    shortName: "AVAX",
    nativeSymbol: "AVAX",
    explorerUrl: "https://snowtrace.io",
  },
];

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export function isSupportedChainId(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}

export function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.name ?? `Chain ${chainId}`;
}

export function getOtherSupportedChainId(chainId: number): number {
  return SUPPORTED_CHAIN_IDS.find((id) => id !== chainId) ?? SUPPORTED_CHAIN_IDS[0];
}

export function getExplorerTxUrl(chainId: number, txHash: string) {
  const explorer = SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.explorerUrl;
  return explorer ? `${explorer}/tx/${txHash}` : undefined;
}
