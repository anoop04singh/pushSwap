'use client'

import Image from "next/image"
import Link from "next/link"
import { usePushChainClient, PushUniversalAccountButton } from "@pushchain/ui-kit"

export function Header() {
  const { account } = usePushChainClient()

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="flex items-center gap-5 text-lg font-medium md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image
            src="/logo.png"
            alt="PushSwap Logo"
            width={150}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <span className="sr-only">PushSwap</span>
        </Link>
      </nav>
      <div className="ml-auto">
        {/* Only show the button if the user is connected */}
        {account && <PushUniversalAccountButton />}
      </div>
    </header>
  )
}