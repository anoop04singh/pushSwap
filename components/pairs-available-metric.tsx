"use client"

import { useState, useEffect } from "react"
import { DollarSign } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// This should ideally be imported from a shared config if used in many places.
// For now, we'll define it here for demonstration.
const TOKENS = {
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

export function PairsAvailableMetric() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real application, you might fetch this from a backend or contract.
    // For now, we'll count the defined tokens.
    setCount(Object.keys(TOKENS).length)
    setIsLoading(false)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pairs Available</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24 mt-1" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground">
              ERC-20 tokens to PC
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}