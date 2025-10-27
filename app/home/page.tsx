import { SwapForm } from "@/components/swap-form"
import { OpenSwaps } from "@/components/open-swaps"
import { UserSwaps } from "@/components/user-swaps"
import { OpenSwapsMetric } from "@/components/open-swaps-metric"
import { PairsAvailableMetric } from "@/components/pairs-available-metric" // Import the new component
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Repeat } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  return (
    <div className="flex justify-center p-4 sm:p-6 lg:p-8">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2">
          <OpenSwapsMetric />
          <PairsAvailableMetric /> {/* Use the new component here */}
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Swap</TabsTrigger>
            <TabsTrigger value="open">Open Swaps</TabsTrigger>
            <TabsTrigger value="my-swaps">My Swaps</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <SwapForm />
          </TabsContent>
          <TabsContent value="open">
            <OpenSwaps />
          </TabsContent>
          <TabsContent value="my-swaps">
            <UserSwaps />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}