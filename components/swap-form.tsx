"use client"

import { useState, useCallback } from "react"
import { ArrowDown, Loader2 } from "lucide-react"
import { usePushChainClient, usePushChain } from "@pushchain/ui-kit"
import { encodeFunctionData } from "viem"
import { ethers } from "ethers"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- CONFIGURATION from test file ---
const HTLCSWAP_CONTRACT_ADDRESS = "0xd831A64c8539Ca4E0c1654C60c5A25Fa35042Fb4"

const TOKENS: Record<string, { address: `0x${string}`; decimals: number }> = {
  USDT: {
    address: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
    decimals: 6,
  },
  // We can add other tokens like USDC here later
}

const IERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]

const HTLCSWAP_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdtToken", type: "address" },
      { internalType: "uint256", name: "_usdtAmount", type: "uint256" },
      { internalType: "uint256", name: "_pcAmount", type: "uint256" },
      { internalType: "bytes32", name: "_hashA", type: "bytes32" },
      { internalType: "bytes32", name: "_secretA", type: "bytes32" },
      { internalType: "uint256", name: "_timelock", type: "uint256" },
    ],
    name: "createSwap",
    outputs: [{ internalType: "bytes32", name: "swapId", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]

export function SwapForm() {
  const { pushChainClient, isInitialized } = usePushChainClient()
  const { PushChain } = usePushChain()

  const [sendAmount, setSendAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("USDT")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateSwap = useCallback(async () => {
    if (!isInitialized || !pushChainClient || !PushChain) {
      toast.error("Wallet not connected or client not initialized.")
      return
    }
    if (!sendAmount || !receiveAmount || parseFloat(sendAmount) <= 0 || parseFloat(receiveAmount) <= 0) {
      toast.error("Please enter valid amounts for the swap.")
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Preparing swap...")

    try {
      // Generate swap parameters
      const RawsecretA = ethers.randomBytes(32)
      const secretA = ethers.hexlify(RawsecretA)
      const hashA = ethers.keccak256(secretA)
      toast.info(`Generated Secret: ${secretA.slice(0, 10)}...`, { id: toastId })

      const tokenInfo = TOKENS[selectedToken]
      const sendAmountParsed = PushChain.utils.helpers.parseUnits(
        sendAmount,
        tokenInfo.decimals
      )
      const receiveAmountParsed = PushChain.utils.helpers.parseUnits(
        receiveAmount,
        18
      ) // PC has 18 decimals
      const timelock = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

      // 1. Approve token spending
      toast.loading("Approving token spend...", { id: toastId })
      const approveTx = await pushChainClient.universal.sendTransaction({
        to: tokenInfo.address,
        data: encodeFunctionData({
          abi: IERC20_ABI,
          functionName: "approve",
          args: [HTLCSWAP_CONTRACT_ADDRESS, sendAmountParsed],
        }),
      })
      await approveTx.wait()
      toast.loading("Token approved. Creating swap...", { id: toastId })

      // 2. Create the swap
      const createSwapTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: "createSwap",
          args: [
            tokenInfo.address,
            sendAmountParsed,
            receiveAmountParsed,
            hashA,
            secretA,
            timelock,
          ],
        }),
      })

      const receipt = await createSwapTx.wait()
      toast.success("Swap created successfully!", {
        id: toastId,
        description: `Transaction Hash: ${receipt.hash.slice(0, 10)}...`,
        action: {
          label: "View on Explorer",
          onClick: () =>
            window.open(
              pushChainClient.explorer.getTransactionUrl(receipt.hash),
              "_blank"
            ),
        },
      })
    } catch (error: any) {
      console.error("Swap creation failed:", error)
      toast.error("Swap creation failed", {
        id: toastId,
        description: error.shortMessage || error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [sendAmount, receiveAmount, selectedToken, isInitialized, pushChainClient, PushChain])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Swap</CardTitle>
        <CardDescription>
          Select the token you want to swap for native PC token.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="you-send">You Send</Label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              id="you-send"
              type="number"
              placeholder="0.0"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              disabled={isLoading}
            />
            <Select
              defaultValue={selectedToken}
              onValueChange={setSelectedToken}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT</SelectItem>
                {/* <SelectItem value="USDC">USDC</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card rounded-full border p-2">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="you-receive">You Receive</Label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              id="you-receive"
              type="number"
              placeholder="0.0"
              value={receiveAmount}
              onChange={(e) => setReceiveAmount(e.target.value)}
              disabled={isLoading}
            />
            <Button variant="outline" className="w-[120px]" disabled>
              PC
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCreateSwap}
          disabled={!isInitialized || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Processing..." : "Create Swap"}
        </Button>
      </CardFooter>
    </Card>
  )
}