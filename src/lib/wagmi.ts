import { http, createConfig } from "wagmi";
import { bsc, mainnet, polygon, sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, bsc],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
