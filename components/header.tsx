'use client'

import { ArrowRightLeft } from "lucide-react"
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
          <ArrowRightLeft className="h-6 w-6" />
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