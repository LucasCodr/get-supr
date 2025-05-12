import axios from "axios";

const api = axios.create({
  baseURL: "https://api.superdapp.dev/swap",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
});

export interface Network {
  id: number;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  name: string;
  chainId: number;
  confirmationTime: number;
  minConfirmations: number;
  precision: number;
  networkImage: string;
  isActive: boolean;
  isPublished: boolean;
}

export type GetNetworksResponse = Network[];

export interface Keypair {
  id: number;
  name: string;
  baseId: number;
  quoteId: number;
  quoteImage: string;
  baseImage: string;
  baseAssetId: string;
  quoteAssetId: string;
  isActive: boolean;
  trending: boolean;
  isPublished: boolean;
  acceptsOtc: boolean;
  price: string;
  baseMinAmount: string;
  quoteMinAmount: string;
  baseMaxAmount: string;
  quoteMaxAmount: string;
  createdAt: string;
  updatedAt: string;
  baseNetwork: string;
  quoteNetwork: string;
  volume: string;
  isBlocked: boolean;
  blockReason: string;
  providerId: number;
  slippageMultiplier: number;
  availableSides: Array<"BUY" | "SELL">;
  availableTypes: Array<"SWAP" | "LIMIT" | "PAY" | "ON_THE_GO">;
  baseNetworkIsActive: boolean;
  quoteNetworkIsActive: boolean;
}

export type GetKeypairsResponse = Keypair[];

export interface QuoteAmounts {
  amount: string;
  baseAmountCurrency: string;
  quoteAmountCurrency: string;
  quoteAmount: string;
  baseAmountWithDiscount: string;
  quoteAmountWithDiscount: string;
  quoteAmountFeePaid: string;
  baseAmountFeePaidInverse: string;
}

export interface QuoteFees {
  networkFee: string;
  serviceFee: string;
  serviceFeeWithDiscount: string;
  networkFeeKLV: string;
  serviceFeeKLV: string;
  serviceFeeKLVWithDiscount: string;
}

export interface QuotePrices {
  keypairPrice: string;
  baseUsdPrice: string;
  quoteUsdPrice: string;
  priceImpact: string;
}

export interface Quote {
  id: number;
  keypairId: number;
  quotationId: string;
  createdAt: string;
  updatedAt: string;
  expireAt: string;
  status: string;
  type: string;
  side: string;
  amounts: QuoteAmounts;
  fees: QuoteFees;
  prices: QuotePrices;
  providerId: number;
  basePrecision: number;
  quotePrecision: number;
  depositAddress: string;
  withdrawAddress: string;
  klvDepositAddress: string;
  hubPointsAmount: number;
}

export interface ExecuteSwapParams {
  txId: string;
  quoteSignature: string;
  quotationId: string;
  toAddress: string;
  fromAddress: string;
  chainId: number;
  depositAddress: string;
  walletName: string;
  origin: string;
}

export interface ExecuteSwapResponse {
  amount: string;
  createdAt: string;
  externalId: string;
  txFeeHash: string;
  txHash: string;
  txStatus: string;
  updatedAt: string;
}

export interface GetQuoteParams {
  amount: number | string;
  keypairId: number;
  orderType: "SWAP";
  price: number | string;
  side: "BUY" | "SELL";
  slippage: number;
  inverse: number;
}

export const apiClient = {
  getNetworks: async (): Promise<GetNetworksResponse> => {
    const response = await api.get<GetNetworksResponse>("/networks");
    return response.data;
  },
  getKeypairs: async (): Promise<GetKeypairsResponse> => {
    const response = await api.get<GetKeypairsResponse>("/keypairs");
    return response.data;
  },
  getQuote: async (params: GetQuoteParams): Promise<Quote> => {
    const response = await api.get<Quote>("/quote", {
      params: {
        amount: params.amount,
        keypairId: params.keypairId,
        orderType: params.orderType,
        price: params.price,
        side: params.side,
        slippage: params.slippage,
        inverse: params.inverse,
      },
    });
    return response.data;
  },
  executeSwap: async (
    params: ExecuteSwapParams,
  ): Promise<ExecuteSwapResponse> => {
    const response = await api.post("/execute", {
      txId: params.txId,
      quoteSignature: params.quoteSignature,
      quotationID: params.quotationId,
      toAddress: params.toAddress,
      fromAddress: params.fromAddress,
      chainId: params.chainId,
      depositAddress: params.depositAddress,
      walletName: params.walletName,
      origin: params.origin,
    });

    return response.data;
  },
};
