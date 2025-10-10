'use client'

import Image from "next/image"
import Link from "next/link"
import { PushUniversalAccountButton } from "@pushchain/ui-kit"

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="flex items-center gap-5 text-lg font-medium md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image
            src="/pushSwapSqWhite.png"
            alt="Pushbridge Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="sr-only">Pushbridge</span>
        </Link>
        <h1 className="text-lg font-semibold">Pushbridge</h1>
      </nav>
      <div className="ml-auto">
        <PushUniversalAccountButton />
      </div>
    </header>
  )
}