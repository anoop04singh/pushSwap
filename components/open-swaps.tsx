"use client"

import { useEffect, useState, useCallback } from "react"
import { usePushChainClient, PushUI } from "@pushchain/ui-kit"
import { ethers } from "ethers"
import { formatUnits, type Hex } from "viem"
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

const HTLCSWAP_CONTRACT_ADDRESS = "0xf20BcDdE8eE2c73dbB69dA423e3c9cA83CDa9C77"

const TOKENS_BY_ADDRESS: Record<string, { symbol: string; decimals: number }> = {
  "0xca0c5e6f002a389e1580f0db7cd06e4549b5f9d3": {
    symbol: "USDT",
    decimals: 6,
  },
}

const HTLCSWAP_ABI = [{
  "inputs": [],
  "name": "getOpenSwaps",
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
    "internalType": "struct HTLCSwapPushChainV2.Swap",
    "name": "",
    "type": "tuple"
  }],
  "stateMutability": "view",
  "type": "function"
}]

interface SwapDetails {
  id: string
  userA: Hex
  ercToken: Hex
  ercAmount: bigint
  pcAmount: bigint
}

export function OpenSwaps() {
  const { pushChainClient, isInitialized } = usePushChainClient()
  const [swaps, setSwaps] = useState<SwapDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  const fetchOpenSwaps = useCallback(async () => {
    setIsLoading(true)
    try {
      const PUSH_RPC_URL = 'https://evm.rpc-testnet-donut-node1.push.org/'
      const pushProvider = new ethers.JsonRpcProvider(PUSH_RPC_URL)
      const htlcContract = new ethers.Contract(
        HTLCSWAP_CONTRACT_ADDRESS,
        HTLCSWAP_ABI,
        pushProvider
      )

      const swapIds: string[] = await htlcContract.getOpenSwaps()

      if (!swapIds || swapIds.length === 0) {
        setSwaps([])
        return
      }

      const swapDetailsPromises = swapIds.map(async (id) => {
        const swapData = await htlcContract.getSwap(id)
        return {
          id,
          userA: swapData.userA,
          ercToken: swapData.ercToken,
          ercAmount: swapData.ercAmount,
          pcAmount: swapData.pcAmount,
        }
      })

      const resolvedSwaps = await Promise.all(swapDetailsPromises)
      setSwaps(resolvedSwaps)
    } catch (error) {
      console.error("Failed to fetch open swaps:", error)
      toast.error("Could not fetch open swaps.")
      setSwaps([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      if (isInitialized && pushChainClient) {
        const address = await pushChainClient.universal.account
        setUserAddress(address)
        fetchOpenSwaps()
      }
    }
    init()
  }, [isInitialized, pushChainClient, fetchOpenSwaps])

  const renderSkeleton = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[150px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[150px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-[100px]" />
        </TableCell>
      </TableRow>
    ))

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Swaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please connect your wallet to view open swaps.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Swaps</CardTitle>
        <CardDescription>
          These are the swaps currently available to participate in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Swap ID</TableHead>
              <TableHead>You Send (PC)</TableHead>
              <TableHead>You Receive</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? renderSkeleton()
              : swaps.length > 0
              ? swaps.map((swap) => {
                  const isOwnSwap = userAddress?.toLowerCase() === swap.userA.toLowerCase()
                  const tokenInfo =
                    TOKENS_BY_ADDRESS[swap.ercToken.toLowerCase()] || {
                      symbol: "UNKNOWN",
                      decimals: 18,
                    }
                  const formattedErcAmount = formatUnits(
                    swap.ercAmount,
                    tokenInfo.decimals
                  )
                  const formattedPcAmount = formatUnits(swap.pcAmount, 18)

                  return (
                    <TableRow key={swap.id}>
                      <TableCell className="font-mono text-xs">{`${swap.id.slice(
                        0,
                        6
                      )}...${swap.id.slice(-4)}`}</TableCell>
                      <TableCell>{formattedPcAmount} PC</TableCell>
                      <TableCell>
                        {formattedErcAmount}{" "}
                        <Badge variant="outline">{tokenInfo.symbol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" asChild>
                          <Link href={`/swap/${swap.id}`}>
                            {isOwnSwap ? "View Your Swap" : "View Swap"}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No open swaps found.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}