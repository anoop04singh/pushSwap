'use client'

import Image from "next/image"
import Link from "next/link"
import { usePushChainClient, PushUniversalAccountButton } from "@pushchain/ui-kit"

export function Header() {
  const { account } = usePushChainClient()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/placeholder-logo.png"
            alt="PushSwap Logo"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="sr-only">PushSwap</span>
        </Link>
        <h1 className="text-2xl font-title font-bold">PushSwap</h1>
      </div>
      <div className="flex items-center">
        {account && <PushUniversalAccountButton />}
      </div>
    </header>
  )
}