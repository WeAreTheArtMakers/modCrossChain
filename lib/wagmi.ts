import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { bsc, mainnet, polygon } from "viem/chains";
import { supportedWagmiChains } from "@/lib/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const walletConnectEnabled = Boolean(walletConnectProjectId);

const connectors = [
  injected({
    target: "metaMask",
  }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: true,
          metadata: {
            name: "modCrossChain Bridge",
            description: "Bridge tokens with LI.FI routing.",
            url: "https://github.com/WeAreTheArtMakers/modCrossChain",
            icons: ["https://avatars.githubusercontent.com/u/9919?s=200&v=4"],
          },
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: supportedWagmiChains,
  connectors,
  ssr: true,
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || undefined),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BNB_RPC_URL || undefined),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || undefined),
  },
});
