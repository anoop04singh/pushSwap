'use client'

import Image from "next/image"
import Link from "next/link"
import { PushUniversalAccountButton } from "@pushchain/ui-kit"

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-primary/20 bg-background/80 px-4 backdrop-blur-lg shadow-lg shadow-primary/20 md:px-6">
      <nav className="flex items-center gap-5 text-lg font-medium md:text-sm lg:gap-6">
        <Link
          href="/home"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image
            src="/pushSwapSqWhite.png"
            alt="pushSwap Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="sr-only">pushSwap</span>
        </Link>
      </nav>
      <div className="ml-auto">
        <PushUniversalAccountButton />
      </div>
    </header>
  )
}