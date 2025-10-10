"use client"

import { useEffect } from "react"
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
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-playfair text-6xl md:text-8xl font-bold italic text-primary">
          pushSwap
        </h1>
        <p className="text-muted-foreground">
          Connect your wallet to continue
        </p>
        <div className="mt-4">
          <PushUniversalAccountButton />
        </div>
      </div>
    </main>
  )
}