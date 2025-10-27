"use client"

import { useEffect, useState, useCallback } from "react"
import { ethers } from "ethers"
import { Repeat } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const HTLCSWAP_CONTRACT_ADDRESS = "0x048B25C19b0AB50ec1F0582853aC90501Dd6D7B1"
const HTLCSWAP_ABI = [{
  "inputs": [],
  "name": "getOpenSwaps",
  "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
  "stateMutability": "view",
  "type": "function"
}]

export function OpenSwapsMetric() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOpenSwapsCount = useCallback(async () => {
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
      setCount(swapIds.length)
    } catch (error) {
      console.error("Failed to fetch open swaps count:", error)
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOpenSwapsCount()
  }, [fetchOpenSwapsCount])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Open Swaps</CardTitle>
        <Repeat className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32 mt-1" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available to participate
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}