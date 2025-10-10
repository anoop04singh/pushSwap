"use client"

import Image from "next/image"
import { PushUniversalAccountButton } from "@pushchain/ui-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ConnectWalletPrompt() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <Image
            src="/logo.png"
            alt="PushSwap Logo"
            width={200}
            height={53}
            className="h-10 w-auto"
            priority
          />
          <CardTitle className="pt-4 text-2xl">Welcome to PushSwap</CardTitle>
          <CardDescription>
            The decentralized P2P platform to swap tokens on Pushchain.
            Connect your wallet to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <PushUniversalAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}