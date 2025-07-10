import {
  Alert,
  Autocomplete,
  AutocompleteItem,
  Button,
  Image,
  Input,
  Spinner,
  addToast,
} from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { erc20Abi, parseEther, parseUnits } from "viem";
import {
  type BaseError,
  useAccount,
  useConnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import { writeContract } from "wagmi/actions";
import { metaMask } from "wagmi/connectors";
import { config } from "~/lib/wagmi";
import { useKeypairs, useNetworks } from "../hooks/useSwapAPI";
import {
  type Keypair,
  type Network,
  type Quote,
  apiClient,
} from "../services/api";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  const { address } = useAccount();
  const { connect } = useConnect();

  const [network, setNetwork] = useState<Network | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);

  const { data: networks, isLoading: isLoadingNetworks } = useNetworks();
  const { data: keypairs, isLoading: isLoadingKeypairs } = useKeypairs();

  const handleGetQuote = useCallback(async () => {
    if (!keypair || !amount) return;

    setIsLoadingQuote(true);
    try {
      const quoteResponse = await apiClient.getQuote({
        amount,
        keypairId: keypair.id,
        orderType: "SWAP",
        price: "0",
        side: "BUY",
        slippage: 1,
        inverse: 1,
      });
      setQuote(quoteResponse);
      setAmount(keypair.baseMinAmount);
    } catch (error) {
      console.error("Failed to get quote:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [keypair, amount]);

  console.log(quote);

  return (
    <div className="container mx-auto min-h-[calc(100vh-65px)] max-w-lg p-4">
      {address ? (
        <div className="flex flex-col gap-6">
          <Alert color="success" title="Connected!" description={address} />

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-gray-800 text-xl">
                Select Assets
              </h2>
              <Autocomplete
                className="w-full"
                isLoading={isLoadingNetworks}
                defaultItems={networks || []}
                label="Network"
                placeholder="Select a network..."
                variant="bordered"
                onSelectionChange={(networkKey) => {
                  console.log(networkKey);
                  const network = networks?.find(
                    (n) => n.id === Number(networkKey),
                  );

                  setNetwork(network ?? null);
                  setKeypair(null);
                  setQuote(null);
                }}
              >
                {(network) => (
                  <AutocompleteItem
                    key={network.id}
                    className="capitalize"
                    startContent={
                      <Image src={network.networkImage} width={24} />
                    }
                  >
                    {network.fullName}
                  </AutocompleteItem>
                )}
              </Autocomplete>

              {network && (
                <Autocomplete
                  className="w-full"
                  isLoading={isLoadingKeypairs}
                  defaultItems={(keypairs || []).filter(
                    (item) =>
                      item.baseNetwork === network.name &&
                      item.quoteNetwork === network.name,
                  )}
                  label="Trading Pair"
                  placeholder="Select a trading pair..."
                  variant="bordered"
                  isDisabled={!network}
                  onSelectionChange={(keypairKey) => {
                    const keypair = keypairs?.find(
                      (item) => item.id === Number(keypairKey),
                    );

                    setKeypair(keypair ?? null);
                    setQuote(null);
                  }}
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.id}
                      className="capitalize"
                      startContent={
                        <div className="flex gap-2">
                          <Image src={item.baseImage} width={24} />
                          <Image src={item.quoteImage} width={24} />
                        </div>
                      }
                    >
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}

              {keypair && (
                <div className="flex flex-col gap-4">
                  <Input
                    type="number"
                    label="Amount"
                    placeholder="Enter amount..."
                    min={Number(keypair.baseMinAmount)}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setQuote(null);
                    }}
                  />
                  <Button
                    color="primary"
                    isLoading={isLoadingQuote}
                    onPress={handleGetQuote}
                    isDisabled={!amount}
                  >
                    Get Quote
                  </Button>
                </div>
              )}
            </div>
          </div>

          {quote && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800 text-xl">
                Quote Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">You Pay</span>
                  <span className="font-medium">
                    {quote.amounts.amount} {keypair?.name.split("-")[1]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">You Receive</span>
                  <span className="font-medium">
                    {quote.amounts.quoteAmount} {keypair?.name.split("-")[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price Impact</span>
                  <span className="font-medium">
                    {quote.prices.priceImpact}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-medium">{quote.fees.networkFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{quote.fees.serviceFee}%</span>
                </div>
                <div className="border-gray-200 border-t pt-4">
                  <Button
                    color="primary"
                    className="w-full"
                    isLoading={isSending || isSigning || isExecutingSwap}
                    isDisabled={!quote || !address}
                    onPress={async () => {
                      if (!quote || !address) return;

                      try {
                        setIsExecutingSwap(true);

                        const signature = await signMessageAsync({
                          message: quote.quotationId,
                        });

                        const tx = await writeContract(config, {
                          abi: erc20Abi,
                          address: keypair?.quoteAssetId as `0x${string}`,
                          functionName: "transfer",
                          args: [
                            quote.depositAddress as `0x${string}`,
                            parseUnits(
                              quote.amounts.amount,
                              quote.quotePrecision,
                            ),
                          ],
                        });

                        await apiClient.executeSwap({
                          txId: tx,
                          quoteSignature: signature,
                          quotationId: quote.quotationId,
                          toAddress: address,
                          fromAddress: address,
                          chainId: 56,
                          depositAddress: quote.depositAddress,
                          walletName: "metamask",
                          origin: "Get SUPR Test",
                        });

                        setQuote(null);
                        setAmount("");
                      } catch (error) {
                        console.error("Failed to execute swap:", error);
                        addToast({
                          color: "danger",
                          title: "Error",
                          size: "lg",
                          shouldShowTimeoutProgress: true,
                          description:
                            (error as BaseError)?.shortMessage ||
                            (error as Error)?.message,
                        });
                      } finally {
                        setIsExecutingSwap(false);
                      }
                    }}
                  >
                    Swap Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Button
            color="primary"
            onPress={() => {
              connect({ connector: metaMask() });
            }}
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
