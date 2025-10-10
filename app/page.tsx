'use client'

import { useEffect, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PushUniversalAccountButton } from "@pushchain/ui-kit"
import { DollarSign, Repeat } from "lucide-react"

export default function HomePage() {
  const { isInitialized, account } = usePushChainClient()
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  useEffect(() => {
    if (isInitialized && account) {
      setIsWalletConnected(true)
    } else {
      setIsWalletConnected(false)
    }
  }, [isInitialized, account])

  return (
    <>
      <Dialog open={!isWalletConnected} modal={true}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Connect Your Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to access the PushSwap application and
              start swapping.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <PushUniversalAccountButton />
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={`flex justify-center p-4 sm:p-6 lg:p-8 transition-filter duration-300 ${
          !isWalletConnected ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <main className="flex w-full max-w-2xl flex-1 flex-col gap-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Swaps
                </CardTitle>
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
                </CardTitle>
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
    </>
  )
}