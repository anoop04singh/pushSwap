"use client"

import { useEffect, useState, useCallback } from "react"
import { usePushChainClient } from "@pushchain/ui-kit"
import { ethers } from "ethers"
import { formatUnits, type Hex, encodeFunctionData } from "viem"
import { toast } from "sonner"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusModal } from "@/components/status-modal"
import { Loader2 } from "lucide-react"

const HTLCSWAP_CONTRACT_ADDRESS = "0xf20BcDdE8eE2c73dbB69dA423e3c9cA83CDa9C77"

const TOKENS_BY_ADDRESS: Record<string, { symbol: string; decimals: number }> = {
  "0xca0c5e6f002a389e1580f0db7cd06e4549b5f9d3": {
    symbol: "USDT",
    decimals: 6,
  },
}

const HTLCSWAP_ABI = [{
  "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
  "name": "getUserCreatedSwaps",
  "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
  "name": "getUserParticipatedSwaps",
  "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
  "stateMutability": "view",
  "type": "function"
}, {
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
    "internalType": "struct HTLCSwapPushChainV3.Swap",
    "name": "",
    "type": "tuple"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "_swapId", "type": "bytes32"}],
  "name": "refundSwap",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}];

interface SwapDetails {
  id: string
  ercToken: Hex
  ercAmount: bigint
  pcAmount: bigint
  state: number
  userA: Hex
  timelock: bigint
}

const states = ['NONE', 'OPEN', 'LOCKED', 'COMPLETED', 'REFUNDED']

const SwapTable = ({ swaps, isLoading, handleRefund, isCreatedTab, isRefunding, refundingId }: { swaps: SwapDetails[], isLoading: boolean, handleRefund: (swapId: string) => void, isCreatedTab: boolean, isRefunding: boolean, refundingId: string | null }) => {
  const renderSkeleton = () =>
    Array.from({ length: 2 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
      </TableRow>
    ))

  if (isLoading) {
    return <TableBody>{renderSkeleton()}</TableBody>
  }

  if (swaps.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center h-24">
            No swaps found.
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody>
      {swaps.map((swap) => {
        const tokenInfo = TOKENS_BY_ADDRESS[swap.ercToken.toLowerCase()] || { symbol: "UNKNOWN", decimals: 18 }
        const formattedErcAmount = formatUnits(swap.ercAmount, tokenInfo.decimals)
        const formattedPcAmount = formatUnits(swap.pcAmount, 18)
        const now = Math.floor(Date.now() / 1000)
        const isExpired = swap.state === 1 && Number(swap.timelock) < now

        return (
          <TableRow key={swap.id}>
            <TableCell className="font-mono text-xs">{`${swap.id.slice(0, 6)}...${swap.id.slice(-4)}`}</TableCell>
            <TableCell>
              {isCreatedTab
                ? `${formattedErcAmount} ${tokenInfo.symbol}`
                : `${formattedPcAmount} PC`}
            </TableCell>
            <TableCell>
              {isCreatedTab
                ? `${formattedPcAmount} PC`
                : `${formattedErcAmount} ${tokenInfo.symbol}`}
            </TableCell>
            <TableCell><Badge variant="outline">{states[swap.state]}</Badge></TableCell>
            <TableCell>
              {isCreatedTab && isExpired ? (
                <Button size="sm" variant="destructive" onClick={() => handleRefund(swap.id)} disabled={isRefunding && refundingId === swap.id}>
                  {isRefunding && refundingId === swap.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Refund
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href={`/swap/${swap.id}`}>View</Link>
                </Button>
              )}
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  )
}

export function UserSwaps() {
  const { pushChainClient, isInitialized } = usePushChainClient()
  const [createdSwaps, setCreatedSwaps] = useState<SwapDetails[]>([])
  const [participatedSwaps, setParticipatedSwaps] = useState<SwapDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundingId, setRefundingId] = useState<string | null>(null)
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

  const fetchUserSwaps = useCallback(async (userAddress: string) => {
    setIsLoading(true)
    try {
      const PUSH_RPC_URL = 'https://evm.rpc-testnet-donut-node1.push.org/'
      const pushProvider = new ethers.JsonRpcProvider(PUSH_RPC_URL)
      const htlcContract = new ethers.Contract(HTLCSWAP_CONTRACT_ADDRESS, HTLCSWAP_ABI, pushProvider)

      const [createdSwapIds, participatedSwapIds] = await Promise.all([
        htlcContract.getUserCreatedSwaps(userAddress),
        htlcContract.getUserParticipatedSwaps(userAddress),
      ])

      const fetchDetails = async (ids: string[]): Promise<SwapDetails[]> => {
        if (!ids || ids.length === 0) return []
        const detailsPromises = ids.map(async (id) => {
          const swapData = await htlcContract.getSwap(id)
          return {
            id,
            ercToken: swapData.ercToken,
            ercAmount: swapData.ercAmount,
            pcAmount: swapData.pcAmount,
            state: Number(swapData.state),
            userA: swapData.userA,
            timelock: swapData.timelock,
          }
        })
        return Promise.all(detailsPromises)
      }

      const [created, participated] = await Promise.all([
        fetchDetails(createdSwapIds),
        fetchDetails(participatedSwapIds),
      ])

      setCreatedSwaps(created.reverse())
      setParticipatedSwaps(participated.reverse())
    } catch (error) {
      console.error("Failed to fetch user swaps:", error)
      toast.error("Could not fetch your swaps.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      if (isInitialized && pushChainClient) {
        const address = await pushChainClient.universal.account
        if (address) {
          setUserAddress(address)
          fetchUserSwaps(address)
        }
      } else {
        setIsLoading(false)
      }
    }
    init()
  }, [isInitialized, pushChainClient, fetchUserSwaps])

  const handleRefund = useCallback(async (swapId: string) => {
    if (!isInitialized || !pushChainClient) {
      setModalState({ isOpen: true, status: "error", title: "Error", description: "Wallet not connected." })
      return
    }
    setIsRefunding(true)
    setRefundingId(swapId)
    setModalState({ isOpen: true, status: "loading", title: "Processing Refund", description: "Please confirm the transaction in your wallet." })

    try {
      const refundTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: "refundSwap",
          args: [swapId],
        }),
      })

      const receipt = await refundTx.wait()
      setModalState({
        isOpen: true,
        status: "success",
        title: "Refund Successful!",
        description: "Your funds have been returned to your wallet.",
        actionLabel: "View on Explorer",
        onAction: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
      })
      if (userAddress) {
        fetchUserSwaps(userAddress)
      }
    } catch (error: any) {
      console.error("Refund failed:", error)
      setModalState({ isOpen: true, status: "error", title: "Refund Failed", description: error.shortMessage || error.message })
    } finally {
      setIsRefunding(false)
      setRefundingId(null)
    }
  }, [pushChainClient, isInitialized, userAddress, fetchUserSwaps])

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Swaps</CardTitle>
          <CardDescription>
            Swaps you have created or participated in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Please connect your wallet to view your swaps.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Swaps</CardTitle>
          <CardDescription>Swaps you have created or participated in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="created">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="created">Created</TabsTrigger>
              <TabsTrigger value="participated">Participated</TabsTrigger>
            </TabsList>
            <TabsContent value="created" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>You Send</TableHead>
                    <TableHead>You Receive</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <SwapTable swaps={createdSwaps} isLoading={isLoading} handleRefund={handleRefund} isCreatedTab={true} isRefunding={isRefunding} refundingId={refundingId} />
              </Table>
            </TabsContent>
            <TabsContent value="participated" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>You Send</TableHead>
                    <TableHead>You Receive</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <SwapTable swaps={participatedSwaps} isLoading={isLoading} handleRefund={handleRefund} isCreatedTab={false} isRefunding={isRefunding} refundingId={refundingId} />
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
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