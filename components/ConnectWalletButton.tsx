"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { walletConnectEnabled } from "@/lib/wagmi";
import { shortenAddress } from "@/lib/format";

export function ConnectWalletButton() {
  const [open, setOpen] = useState(false);
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-11 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm font-semibold text-zinc-100 transition hover:border-[#ba9eff]/60 hover:text-[#e4c6ff]"
      >
        {isConnected && address ? shortenAddress(address) : "Connect wallet"}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-zinc-800 bg-[#0d100f] p-2 shadow-2xl shadow-black/50">
          {isConnected ? (
            <div className="space-y-2">
              <div className="rounded-md bg-zinc-950 px-3 py-2">
                <p className="text-xs text-zinc-500">Connected with</p>
                <p className="mt-1 text-sm font-medium text-white">{connector?.name ?? "Wallet"}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="h-10 w-full rounded-lg border border-zinc-800 text-sm font-medium text-zinc-200 transition hover:border-red-300/60 hover:text-red-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {connectors.map((walletConnector) => (
                <button
                  key={walletConnector.uid}
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector: walletConnector });
                    setOpen(false);
                  }}
                  className="h-10 w-full rounded-lg border border-zinc-800 px-3 text-left text-sm font-medium text-zinc-100 transition hover:border-[#ba9eff]/60 hover:text-[#e4c6ff] disabled:cursor-wait disabled:text-zinc-500"
                >
                  {walletConnector.name}
                </button>
              ))}

              {!walletConnectEnabled ? (
                <p className="rounded-md bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
                  Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable WalletConnect.
                </p>
              ) : null}

              {error ? <p className="px-1 text-xs text-red-300">{error.message}</p> : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
