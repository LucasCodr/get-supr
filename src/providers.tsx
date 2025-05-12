import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { queryClient } from "~/lib/query.ts";
import { config } from "./lib/wagmi";

export function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider placement="bottom-center" />
          {children}
        </QueryClientProvider>
      </HeroUIProvider>
    </WagmiProvider>
  );
}
