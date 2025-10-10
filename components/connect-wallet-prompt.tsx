"use client"

import Image from "next/image"
import { PushUniversalAccountButton } from "@pushchain/ui-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ConnectWalletPrompt() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center space-y-4 p-8 text-center">
          <Image
            src="/logo.png"
            alt="PushSwap Logo"
            width={96}
            height={96}
            className="h-24 w-24"
            priority
          />
          <div className="space-y-2 pt-4">
            <CardTitle className="text-3xl font-bold">Welcome to PushSwap</CardTitle>
            <CardDescription className="text-base">
              The decentralized P2P platform to swap tokens on Pushchain.
              Connect your wallet to get started.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="flex justify-center">
            <PushUniversalAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}