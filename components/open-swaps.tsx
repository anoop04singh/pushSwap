"use client"

import { useEffect, useState } from "react"
import { usePushChainClient } from "@pushchain/ui-kit"
import { formatUnits } from "viem"
import { toast } from "sonner"

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

const HTLCSWAP_CONTRACT_ADDRESS = "0xd831A64c8539Ca4E0c1654C60c5A25Fa35042Fb4"

const TOKENS_BY_ADDRESS: Record<string, { symbol: string; decimals: number }> = {
  "0xca0c5e6f002a389e1580f0db7cd06e4549b5f9d3": {
    symbol: "USDT",
    decimals: 6,
  },
}

const HTLCSWAP_ABI = [
  {
    inputs: [],
    name: "getOpenSwaps",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "swaps",
    outputs: [
      { internalType: "address", name: "initiator", type: "address" },
      { internalType: "address", name: "participant", type: "address" },
      { internalType: "address", name: "usdtToken", type: "address" },
      { internalType: "uint256", name: "usdtAmount", type: "uint256" },
      { internalType: "uint256", name: "pcAmount", type: "uint256" },
      { internalType: "bytes32", name: "hashA", type: "bytes32" },
      { internalType: "bytes32", name: "secretA", type: "bytes32" },
      { internalType: "bytes32", name: "secretB", type: "bytes32" },
      { internalType: "uint256", name: "timelock", type: "uint256" },
      { internalType: "uint8", name: "state", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
]

interface SwapDetails {
  id: string
  usdtToken: `0x${string}`
  usdtAmount: bigint
  pcAmount: bigint
}

export function OpenSwaps() {
  const { pushChainClient, isInitialized } = usePushChainClient()
  const [swaps, setSwaps] = useState<SwapDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOpenSwaps() {
      if (!isInitialized || !pushChainClient) {
        return
      }
      setIsLoading(true)
      try {
        const swapIds = await pushChainClient.readContract({
          address: HTLCSWAP_CONTRACT_ADDRESS,
          abi: HTLCSWAP_ABI,
          functionName: "getOpenSwaps",
        })

        if (!swapIds || swapIds.length === 0) {
          setSwaps([])
          return
        }

        const swapDetailsPromises = swapIds.map(async (id) => {
          const swapData = await pushChainClient.readContract({
            address: HTLCSWAP_CONTRACT_ADDRESS,
            abi: HTLCSWAP_ABI,
            functionName: "swaps",
            args: [id],
          })
          return {
            id,
            usdtToken: swapData[2],
            usdtAmount: swapData[3],
            pcAmount: swapData[4],
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
    }

    fetchOpenSwaps()
  }, [isInitialized, pushChainClient])

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
                  const tokenInfo =
                    TOKENS_BY_ADDRESS[swap.usdtToken.toLowerCase()] || {
                      symbol: "UNKNOWN",
                      decimals: 18,
                    }
                  const formattedUsdtAmount = formatUnits(
                    swap.usdtAmount,
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
                        {formattedUsdtAmount}{" "}
                        <Badge variant="outline">{tokenInfo.symbol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" disabled>
                          Participate
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