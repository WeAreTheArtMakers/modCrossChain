import type { CreateConnectorFn } from "@wagmi/core";
import { createConfig } from "wagmi";
import { injected, mock } from "wagmi/connectors";
import { BRAND_ICON_URL, BRAND_NAME, BRAND_PRODUCT_URL, BRAND_TAGLINE } from "@/lib/branding";
import { supportedWagmiChains } from "@/lib/chains";
import { rpcTransports } from "@/lib/rpc";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const mockWalletEnabled = process.env.NEXT_PUBLIC_ENABLE_TEST_WALLET === "true";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || BRAND_PRODUCT_URL;

export const walletConnectEnabled = Boolean(walletConnectProjectId);

const connectors: CreateConnectorFn[] = [
  ...(mockWalletEnabled
    ? [
        mock({
          accounts: ["0xA11cE00000000000000000000000000000000001"],
          features: {
            defaultConnected: false,
            reconnect: true,
          },
        }),
      ]
    : []),
  injected(),
];

export const wagmiConfig = createConfig({
  chains: supportedWagmiChains,
  connectors,
  ssr: true,
  transports: rpcTransports,
});

export async function createWalletConnectConnector(): Promise<CreateConnectorFn | undefined> {
  if (!walletConnectProjectId) {
    return undefined;
  }

  const { walletConnect } = await import("wagmi/connectors");
  return walletConnect({
    projectId: walletConnectProjectId,
    showQrModal: true,
    metadata: {
      name: `${BRAND_NAME} Bridge`,
      description: BRAND_TAGLINE,
      url: appUrl,
      icons: [BRAND_ICON_URL],
    },
  });
}
