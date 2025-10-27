"use client"

import { useState, useCallback } from "react"
import { ArrowDown, Loader2 } from "lucide-react"
import { usePushChainClient, usePushChain } from "@pushchain/ui-kit"
import { encodeFunctionData } from "viem"
import { ethers } from "ethers"

import { StatusModal } from "@/components/status-modal"
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
const HTLCSWAP_CONTRACT_ADDRESS = "0x048B25C19b0AB50ec1F0582853aC90501Dd6D7B1"

const TOKENS: Record<string, { address: `0x${string}`; decimals: number }> = {
  USDT: {
    address: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
    decimals: 6,
  },
  pETH: {
    address: "0x2971824Db68229D087931155C2b8bB820B275809",
    decimals: 18,
  },
  pSOL: {
    address: "0x5D525Df2bD99a6e7ec58b76aF2fd95F39874EBed",
    decimals: 18,
  },
  "pETH.base": {
    address: "0xc7007af2B24D4eb963fc9633B0c66e1d2D90Fc21",
    decimals: 18,
  },
  "USDC.eth": {
    address: "0x387b9C8Db60E74999aAAC5A2b7825b400F12d68E",
    decimals: 6,
  },
  USDC: {
    address: "0x8afc81487682024368AC225B799C3b325D82BEB4",
    decimals: 6,
  },
  "USDT.arb": {
    address: "0x76Ad08339dF606BeEDe06f90e3FaF82c5b2fb2E9",
    decimals: 6,
  },
  "USDT.sol": {
    address: "0x4f1A3D22d170a2F4Bddb37845a962322e24f4e34",
    decimals: 6,
  },
  WETH: {
    address: "0x9e9eE7F2e34a61ADC7b9d40F5Cf02b1841dC8dA9",
    decimals: 18,
  },
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
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    status: "loading" | "success" | "error"
    title: string
    description: React.ReactNode
    onAction?: () => void
    actionLabel?: string
  }>({
    isOpen: false,
    status: "loading",
    title: "",
    description: "",
  })

  const handleCreateSwap = useCallback(async () => {
    if (!isInitialized || !pushChainClient || !PushChain) {
      setModalState({ isOpen: true, status: "error", title: "Error", description: "Wallet not connected or client not initialized." })
      return
    }
    if (!sendAmount || !receiveAmount || parseFloat(sendAmount) <= 0 || parseFloat(receiveAmount) <= 0) {
      setModalState({ isOpen: true, status: "error", title: "Invalid Input", description: "Please enter valid amounts for the swap." })
      return
    }

    setIsLoading(true)
    setModalState({ isOpen: true, status: "loading", title: "Preparing Swap...", description: "Generating secrets and preparing your transaction." })

    try {
      // Generate swap parameters
      const RawsecretA = ethers.randomBytes(32)
      const secretA = ethers.hexlify(RawsecretA)
      const hashA = ethers.keccak256(secretA)

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
      setModalState(prev => ({ ...prev, title: "Awaiting Approval", description: "Please approve the token spending in your wallet." }))
      const approveTx = await pushChainClient.universal.sendTransaction({
        to: tokenInfo.address,
        data: encodeFunctionData({
          abi: IERC20_ABI,
          functionName: "approve",
          args: [HTLCSWAP_CONTRACT_ADDRESS, sendAmountParsed],
        }),
      })
      await approveTx.wait()
      setModalState(prev => ({ ...prev, title: "Creating Swap", description: "Token approved. Please confirm the swap creation transaction." }))

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
      setModalState({
        isOpen: true,
        status: "success",
        title: "Swap Created Successfully!",
        description: (
          <>
            <p>Your swap has been created. You can view it in the 'My Swaps' tab.</p>
            <p className="font-bold mt-2">IMPORTANT: Save your secret!</p>
            <p className="font-mono text-xs break-all bg-muted p-2 rounded-md">{secretA}</p>
          </>
        ),
        actionLabel: "View on Explorer",
        onAction: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
      })
      setSendAmount("")
      setReceiveAmount("")
    } catch (error: any) {
      console.error("Swap creation failed:", error)
      setModalState({
        isOpen: true,
        status: "error",
        title: "Swap Creation Failed",
        description: error.shortMessage || error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [sendAmount, receiveAmount, selectedToken, isInitialized, pushChainClient, PushChain])

  return (
    <>
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
                  {Object.keys(TOKENS).map((tokenSymbol) => (
                    <SelectItem key={tokenSymbol} value={tokenSymbol}>
                      {tokenSymbol}
                    </SelectItem>
                  ))}
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
      <StatusModal
        isOpen={modalState.isOpen}
        onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}
        status={modalState.status}
        title={modalState.title}
        description={modalState.description}
        actionLabel={modalState.actionLabel}
        onAction={modalState.onAction}
      />
    </>
  )
}