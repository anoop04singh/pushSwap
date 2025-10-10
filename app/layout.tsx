import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "pushSwap",
  description: "A peer-to-peer atomic swap application for the Pushchain network.",
  authors: [{ name: "0xanoop" }],
  icons: {
    icon: "/pushSwapSqBlack.png",
  },
}

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["700"],
  variable: "--font-playfair",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="flex min-h-screen w-full flex-col">
              <Suspense>{children}</Suspense>
            </div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}