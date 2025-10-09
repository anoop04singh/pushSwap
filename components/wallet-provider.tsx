'use client'

import {
  PushUniversalWalletProvider,
  PushUI,
} from '@pushchain/ui-kit'
import type { ReactNode } from 'react'

export function WalletProvider({ children }: { children: ReactNode }) {
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  }

  return (
    <PushUniversalWalletProvider config={walletConfig}>
      {children}
    </PushUniversalWalletProvider>
  )
}