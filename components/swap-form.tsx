"use client"

import { ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SwapForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Swap</CardTitle>
        <CardDescription>
          Select the token you want to swap for native PC token.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="you-send">You Send</Label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input id="you-send" type="number" placeholder="0.0" />
            <Select defaultValue="eth">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eth">ETH</SelectItem>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="usdt">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card rounded-full border p-2">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="you-receive">You Receive</Label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input id="you-receive" type="number" placeholder="0.0" readOnly />
            <Button variant="outline" className="w-[120px]" disabled>
              PC
            </Button>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          1 ETH = 1500 PC
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create Swap</Button>
      </CardFooter>
    </Card>
  )
}