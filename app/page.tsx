"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { usePushChainClient, PushUniversalAccountButton } from "@pushchain/ui-kit"

export default function WelcomePage() {
  const { isInitialized } = usePushChainClient()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized) {
      router.push("/home")
    }
  }, [isInitialized, router])

  return (
    <main className="flex h-screen flex-col items-center justify-center text-center p-4">
      <div className="flex flex-col items-center gap-4 max-w-md">
        <Image
          src="/pushSwapSqWhite.png"
          alt="pushSwap Logo"
          width={128}
          height={128}
          className="h-32 w-32"
        />
        <h1 className="font-playfair text-6xl md:text-8xl font-bold italic text-primary">
          pushSwap
        </h1>
        <p className="text-lg text-foreground/80 mt-2">
          Peer-to-peer atomic swaps on the Pushchain network.
        </p>
        <p className="text-muted-foreground mt-4">
          Connect your wallet to continue
        </p>
        <div className="mt-2">
          <PushUniversalAccountButton />
        </div>
      </div>
    </main>
  )
}