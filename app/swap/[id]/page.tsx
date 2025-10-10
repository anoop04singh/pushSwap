"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePushChainClient, PushUI } from "@pushchain/ui-kit"
import { ethers } from "ethers"
import { formatUnits, encodeFunctionData, type Hex } from "viem"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// --- Contract Config ---
const HTLCSWAP_CONTRACT_ADDRESS = "0xf20BcDdE8eE2c73dbB69dA423e3c9cA83CDa9C77"
const TOKENS_BY_ADDRESS: Record<string, { symbol: string; decimals: number }> = {
  "0xca0c5e6f002a389e1580f0db7cd06e4549b5f9d3": {
    symbol: "USDT",
    decimals: 6,
  },
}
const HTLCSWAP_ABI = [{
  "inputs": [{"internalType": "bytes32", "name": "_swapId", "type": "bytes32"}],
  "name": "getSwap",
  "outputs": [{
    "components": [
      {"internalType": "address", "name": "userA", "type": "address"},
      {"internalType": "address", "name": "userB", "type": "address"},
      {"internalType": "uint256", "name": "ercAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "pcAmount", "type": "uint256"},
      {"internalType": "bytes32", "name": "hashA", "type": "bytes32"},
      {"internalType": "bytes32", "name": "hashB", "type": "bytes32"},
      {"internalType": "uint256", "name": "timelock", "type": "uint256"},
      {"internalType": "uint8", "name": "state", "type": "uint8"},
      {"internalType": "address", "name": "ercToken", "type": "address"}
    ],
    "internalType": "struct HTLCSwapPushChainV2.Swap",
    "name": "",
    "type": "tuple"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [
    {"internalType": "bytes32", "name": "_swapId", "type": "bytes32"},
    {"internalType": "bytes32", "name": "_hashB", "type": "bytes32"},
    {"internalType": "bytes32", "name": "_secretB", "type": "bytes32"}
  ],
  "name": "participateSwap",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}]

interface SwapDetails {
  id: string
  userA: Hex
  userB: Hex
  ercToken: Hex
  ercAmount: bigint
  pcAmount: bigint
  state: number
}

export default function SwapDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const swapId = params.id as string

  const { pushChainClient, isInitialized } = usePushChainClient()
  const [swapDetails, setSwapDetails] = useState<SwapDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isParticipating, setIsParticipating] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  const fetchSwapDetails = useCallback(async () => {
    if (!swapId) return
    setIsLoading(true)
    try {
      const PUSH_RPC_URL = PushUI.CONSTANTS.PUSH_NETWORK.TESTNET.RPC
      const pushProvider = new ethers.JsonRpcProvider(PUSH_RPC_URL)
      const htlcContract = new ethers.Contract(
        HTLCSWAP_CONTRACT_ADDRESS,
        HTLCSWAP_ABI,
        pushProvider
      )
      const swapData = await htlcContract.getSwap(swapId)
      setSwapDetails({
        id: swapId,
        userA: swapData.userA,
        userB: swapData.userB,
        ercToken: swapData.ercToken,
        ercAmount: swapData.ercAmount,
        pcAmount: swapData.pcAmount,
        state: Number(swapData.state),
      })
    } catch (error) {
      console.error("Failed to fetch swap details:", error)
      toast.error("Could not fetch swap details.")
      setSwapDetails(null)
    } finally {
      setIsLoading(false)
    }
  }, [swapId])

  useEffect(() => {
    async function init() {
      if (isInitialized && pushChainClient) {
        const address = await pushChainClient.universal.account
        setUserAddress(address)
      }
      fetchSwapDetails()
    }
    init()
  }, [isInitialized, pushChainClient, fetchSwapDetails])

  const handleParticipateSwap = async () => {
    if (!isInitialized || !pushChainClient || !swapDetails) {
      toast.error("Wallet not connected or client not initialized.")
      return
    }

    setIsParticipating(true)
    const toastId = toast.loading("Preparing to participate...")

    try {
      const rawSecretB = ethers.randomBytes(32)
      const secretB = ethers.hexlify(rawSecretB)
      const hashB = ethers.keccak256(rawSecretB)
      toast.loading("Generated secrets. Sending transaction...", { id: toastId })

      const participateTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        value: swapDetails.pcAmount,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: "participateSwap",
          args: [swapDetails.id, hashB, secretB],
        }),
      })

      const receipt = await participateTx.wait()
      toast.success("Successfully participated in swap!", {
        id: toastId,
        description: `Tx: ${receipt.hash.slice(0, 10)}... IMPORTANT: Save your secret! Secret B: ${secretB.slice(0, 10)}...`,
        action: {
          label: "View on Explorer",
          onClick: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
        },
      })
      fetchSwapDetails() // Refresh details
    } catch (error: any) {
      console.error("Participation failed:", error)
      toast.error("Participation failed", {
        id: toastId,
        description: error.shortMessage || error.message,
      })
    } finally {
      setIsParticipating(false)
    }
  }

  const tokenInfo = swapDetails ? TOKENS_BY_ADDRESS[swapDetails.ercToken.toLowerCase()] || { symbol: "UNKNOWN", decimals: 18 } : null
  const formattedErcAmount = swapDetails && tokenInfo ? formatUnits(swapDetails.ercAmount, tokenInfo.decimals) : ""
  const formattedPcAmount = swapDetails ? formatUnits(swapDetails.pcAmount, 18) : ""
  const isOwnSwap = userAddress && swapDetails && userAddress.toLowerCase() === swapDetails.userA.toLowerCase()
  const canParticipate = swapDetails?.state === 0 && !isOwnSwap

  return (
    <div className="flex justify-center p-4 sm:p-6 lg:p-8">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-4 md:gap-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Swap Details</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Swap Details</CardTitle>
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <CardDescription className="font-mono text-xs break-all">
                ID: {swapId}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : swapDetails && tokenInfo ? (
              <>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={swapDetails.state === 0 ? "outline" : "secondary"}>
                    {swapDetails.state === 0 ? "Open" : "Closed/Completed"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Initiator</span>
                  <span className="font-mono text-sm break-all">{swapDetails.userA}</span>
                </div>
                <div className="flex items-center justify-around gap-4 rounded-lg border p-4 text-center">
                  <div>
                    <p className="text-muted-foreground text-sm">You Send</p>
                    <p className="text-xl font-bold">{formattedPcAmount} PC</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">You Receive</p>
                    <p className="text-xl font-bold">{formattedErcAmount} {tokenInfo.symbol}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">Swap not found.</p>
            )}
          </CardContent>
          {swapDetails && (
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleParticipateSwap}
                disabled={!canParticipate || isParticipating || !isInitialized}
              >
                {isParticipating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isOwnSwap ? "This is your swap" : (swapDetails.state !== 0 ? "Swap is not open" : "Participate")}
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  )
}