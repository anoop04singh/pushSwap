'use client'

import { usePushChainClient } from "@pushchain/ui-kit"
import { SwapForm } from "@/components/swap-form"
import { OpenSwaps } from "@/components/open-swaps"
import { UserSwaps } from "@/components/user-swaps"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Repeat } from "lucide-react"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"

export default function HomePage() {
  const { isInitialized, account } = usePushChainClient()

  // Show a dedicated welcome/connect screen until the wallet is initialized and connected
  if (!isInitialized || !account) {
    return <ConnectWalletPrompt />
  }

  // Render the main application content once connected
  return (
    <div className="flex justify-center p-4 sm:p-6 lg:p-8">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Swaps</CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pairs Available
              </              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">56</div>
              <p className="text-xs text-muted-foreground">
                Across multiple chains
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
          <SwapForm />
        </div>
        <div>
          <UserSwaps />
        </div>
        <div>
          <OpenSwaps />
        </div>
      </main>
    </div>
  )
}