"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { usePushChainClient } from "@pushchain/ui-kit"
import { ethers } from "ethers"
import { formatUnits, encodeFunctionData, type Hex } from "viem"
import { ArrowLeft, ArrowRight, Loader2, Info, Users, Lock, Clock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { StatusModal } from "@/components/status-modal"

// --- Contract Config ---
const HTLCSWAP_CONTRACT_ADDRESS = "0x048B25C19b0AB50ec1F0582853aC90501Dd6D7B1"
const TOKENS_BY_ADDRESS: Record<string, { symbol: string; decimals: number }> = {
  "0xca0c5e6f002a389e1580f0db7cd06e4549b5f9d3": {
    symbol: "USDT",
    decimals: 6,
  },
}
const HTLCSWAP_ABI = [{
  "inputs": [{"internalType": "bytes32", "name": "_swapId", "type": "bytes32"}],
  "name": "getSwap",
  "outputs": [{
    "components": [
      {"internalType": "address", "name": "userA", "type": "address"},
      {"internalType": "address", "name": "userB", "type": "address"},
      {"internalType": "uint256", "name": "ercAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "pcAmount", "type": "uint256"},
      {"internalType": "bytes32", "name": "hashA", "type": "bytes32"},
      {"internalType": "bytes32", "name": "hashB", "type": "bytes32"},
      {"internalType": "uint256", "name": "timelock", "type": "uint256"},
      {"internalType": "uint8", "name": "state", "type": "uint8"},
      {"internalType": "address", "name": "ercToken", "type": "address"}
    ],
    "internalType": "struct HTLCSwapPushChainV2.Swap",
    "name": "",
    "type": "tuple"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [
    {"internalType": "bytes32", "name": "_swapId", "type": "bytes32"},
    {"internalType": "bytes32", "name": "_hashB", "type": "bytes32"},
    {"internalType": "bytes32", "name": "_secretB", "type": "bytes32"}
  ],
  "name": "participateSwap",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
  "name": "getUserCreatedSwaps",
  "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
  "name": "getUserParticipatedSwaps",
  "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "_swapId", "type": "bytes32"}],
  "name": "refundSwap",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [
    {"internalType": "bytes32", "name": "_swapId", "type": "bytes32"},
    {"internalType": "bytes32", "name": "_secretB", "type": "bytes32"}
  ],
  "name": "claimByUserA",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [
    {"internalType": "bytes32", "name": "_swapId", "type": "bytes32"},
    {"internalType": "bytes32", "name": "_secretA", "type": "bytes32"}
  ],
  "name": "claimByUserB",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "_swapId", "type": "bytes32"}],
  "name": "getHashToReveal",
  "outputs": [
    {"internalType": "bytes32", "name": "hash", "type": "bytes32"},
    {"internalType": "bool", "name": "isUserA", "type": "bool"}
  ],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "_swapId", "type": "bytes32"}],
  "name": "refundLockedSwap",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}]

interface SwapDetails {
  id: string
  userA: Hex
  userB: Hex
  ercToken: Hex
  ercAmount: bigint
  pcAmount: bigint
  state: number
  hashA: Hex
  hashB: Hex
  timelock: bigint
}

const DetailRow = ({ label, value, isMono = false, children }: { label: string; value?: string | React.ReactNode; isMono?: boolean; children?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 gap-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className={`text-sm text-right ${isMono ? "font-mono break-all" : ""}`}>
      {value || children}
    </div>
  </div>
)

export default function SwapDetailsPage() {
  const params = useParams()
  const swapId = params.id as string

  const { pushChainClient, isInitialized } = usePushChainClient()
  const [swapDetails, setSwapDetails] = useState<SwapDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isParticipating, setIsParticipating] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    status: "loading" | "success" | "error"
    title: string
    description: React.ReactNode
    onAction?: () => void
    actionLabel?: string
  }>({
    isOpen: false,
    status: "loading",
    title: "",
    description: "",
  })

  const fetchSwapDetails = useCallback(async () => {
    if (!swapId) return
    setIsLoading(true)
    try {
      const PUSH_RPC_URL = 'https://evm.rpc-testnet-donut-node1.push.org/'
      const pushProvider = new ethers.JsonRpcProvider(PUSH_RPC_URL)
      const htlcContract = new ethers.Contract(
        HTLCSWAP_CONTRACT_ADDRESS,
        HTLCSWAP_ABI,
        pushProvider
      )
      const swapData = await htlcContract.getSwap(swapId)
      setSwapDetails({
        id: swapId,
        userA: swapData.userA,
        userB: swapData.userB,
        ercToken: swapData.ercToken,
        ercAmount: swapData.ercAmount,
        pcAmount: swapData.pcAmount,
        state: Number(swapData.state),
        hashA: swapData.hashA,
        hashB: swapData.hashB,
        timelock: swapData.timelock,
      })
    } catch (error) {
      console.error("Failed to fetch swap details:", error)
      setSwapDetails(null)
    } finally {
      setIsLoading(false)
    }
  }, [swapId])

  useEffect(() => {
    async function init() {
      if (isInitialized && pushChainClient) {
        const address = await pushChainClient.universal.account
        setUserAddress(address)
      }
      fetchSwapDetails()
    }
    init()
  }, [isInitialized, pushChainClient, fetchSwapDetails])

  useEffect(() => {
    if (!swapDetails?.timelock) return

    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = Number(swapDetails.timelock) - now

      if (remaining <= 0) {
        setTimeRemaining("Expired")
        return
      }

      const hours = Math.floor(remaining / 3600)
      const minutes = Math.floor((remaining % 3600) / 60)
      const seconds = remaining % 60

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [swapDetails?.timelock])

  const executeParticipation = async () => {
    if (!isInitialized || !pushChainClient || !swapDetails) {
      setModalState({ isOpen: true, status: "error", title: "Error", description: "Wallet not connected or client not initialized." })
      return
    }
    setIsParticipating(true)
    setModalState({ isOpen: true, status: "loading", title: "Preparing Swap", description: "Generating secrets and preparing your transaction..." })

    try {
      const rawSecretB = ethers.randomBytes(32)
      const secretB = ethers.hexlify(rawSecretB)
      const hashB = ethers.keccak256(rawSecretB)
      
      setModalState(prev => ({ ...prev, title: "Awaiting Confirmation", description: "Please confirm the transaction in your wallet." }))

      const participateTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        value: swapDetails.pcAmount,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: "participateSwap",
          args: [swapDetails.id, hashB, secretB],
        }),
      })

      setModalState(prev => ({ ...prev, title: "Processing Transaction", description: "Your transaction is being processed on the network..." }))
      const receipt = await participateTx.wait()
      
      setModalState({
        isOpen: true,
        status: "success",
        title: "Participation Successful!",
        description: (
          <div className="flex flex-col gap-2 text-sm">
            <p>You have successfully joined the swap.</p>
            <p className="font-bold">IMPORTANT: Save your secret!</p>
            <p className="font-mono break-all bg-muted p-2 rounded-md text-xs">{secretB}</p>
          </div>
        ),
        actionLabel: "View on Explorer",
        onAction: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
      })
      fetchSwapDetails()
    } catch (error: any) {
      console.error("Participation failed:", error)
      setModalState({ isOpen: true, status: "error", title: "Participation Failed", description: error.shortMessage || error.message })
    } finally {
      setIsParticipating(false)
    }
  }

  const handleRefund = async () => {
    if (!isInitialized || !pushChainClient || !swapDetails) {
      setModalState({ isOpen: true, status: "error", title: "Error", description: "Wallet not connected." })
      return
    }
    setIsRefunding(true)
    setModalState({ isOpen: true, status: "loading", title: "Processing Refund", description: "Please confirm the transaction in your wallet." })

    try {
      const refundTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: "refundSwap",
          args: [swapDetails.id],
        }),
      })

      const receipt = await refundTx.wait()
      setModalState({
        isOpen: true,
        status: "success",
        title: "Refund Successful!",
        description: "Your funds have been returned to your wallet.",
        actionLabel: "View on Explorer",
        onAction: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
      })
      fetchSwapDetails()
    } catch (error: any) {
      console.error("Refund failed:", error)
      setModalState({ isOpen: true, status: "error", title: "Refund Failed", description: error.shortMessage || error.message })
    } finally {
      setIsRefunding(false)
    }
  }

  const handleRefundLockedSwap = async () => {
    if (!isInitialized || !pushChainClient || !swapDetails) {
      setModalState({ isOpen: true, status: "error", title: "Error", description: "Wallet not connected." })
      return
    }
    setIsRefunding(true)
    setModalState({ isOpen: true, status: "loading", title: "Processing Refund", description: "Please confirm the transaction in your wallet." })

    try {
      const refundTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: "refundLockedSwap",
          args: [swapDetails.id],
        }),
      })

      const receipt = await refundTx.wait()
      setModalState({
        isOpen: true,
        status: "success",
        title: "Refund Successful!",
        description: "The locked funds have been returned to both parties.",
        actionLabel: "View on Explorer",
        onAction: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
      })
      fetchSwapDetails()
    } catch (error: any) {
      console.error("Locked swap refund failed:", error)
      setModalState({ isOpen: true, status: "error", title: "Refund Failed", description: error.shortMessage || error.message })
    } finally {
      setIsRefunding(false)
    }
  }

  const handleClaim = async () => {
    if (!isInitialized || !pushChainClient || !swapDetails || !userAddress) {
      setModalState({ isOpen: true, status: "error", title: "Error", description: "Client not initialized." })
      return
    }

    setIsClaiming(true)
    setModalState({ isOpen: true, status: "loading", title: "Processing Claim", description: "Fetching secret from contract..." })

    try {
      const PUSH_RPC_URL = 'https://evm.rpc-testnet-donut-node1.push.org/'
      const pushProvider = new ethers.JsonRpcProvider(PUSH_RPC_URL)
      const htlcContract = new ethers.Contract(HTLCSWAP_CONTRACT_ADDRESS, HTLCSWAP_ABI, pushProvider)

      const [secretToUse] = await htlcContract.getHashToReveal(swapDetails.id, {
        from: userAddress
      })

      if (!secretToUse || secretToUse === ethers.ZeroHash) {
        throw new Error("Invalid secret received from contract. The other party may not have completed their action yet.")
      }

      setModalState(prev => ({ ...prev, description: "Please confirm the claim transaction in your wallet." }))

      const isUserACaller = userAddress.toLowerCase() === swapDetails.userA.toLowerCase()
      const functionName = isUserACaller ? 'claimByUserA' : 'claimByUserB'
      const args = [swapDetails.id, secretToUse as Hex]

      const claimTx = await pushChainClient.universal.sendTransaction({
        to: HTLCSWAP_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: HTLCSWAP_ABI,
          functionName: functionName,
          args: args,
        }),
      })

      setModalState(prev => ({ ...prev, description: "Your transaction is being processed..." }))
      const receipt = await claimTx.wait()

      setModalState({
        isOpen: true,
        status: "success",
        title: "Claim Successful!",
        description: "Your funds have been successfully claimed.",
        actionLabel: "View on Explorer",
        onAction: () => window.open(pushChainClient.explorer.getTransactionUrl(receipt.hash), "_blank"),
      })

      fetchSwapDetails()
    } catch (error: any) {
      console.error("Claim failed:", error)
      setModalState({ isOpen: true, status: "error", title: "Claim Failed", description: error.shortMessage || error.message })
    } finally {
      setIsClaiming(false)
    }
  }

  const states = ['NONE', 'OPEN', 'LOCKED', 'CLAIMEDBYB', 'COMPLETED', 'REFUNDED']
  const tokenInfo = swapDetails ? TOKENS_BY_ADDRESS[swapDetails.ercToken.toLowerCase()] || { symbol: "UNKNOWN", decimals: 18 } : null
  const formattedErcAmount = swapDetails && tokenInfo ? formatUnits(swapDetails.ercAmount, tokenInfo.decimals) : ""
  const formattedPcAmount = swapDetails ? formatUnits(swapDetails.pcAmount, 18) : ""
  const isOwnSwap = userAddress && swapDetails && userAddress.toLowerCase() === swapDetails.userA.toLowerCase()
  const isParticipant = userAddress && swapDetails && userAddress.toLowerCase() === swapDetails.userB.toLowerCase()
  const canParticipate = swapDetails?.state === 1 && !isOwnSwap
  const isExpired = timeRemaining === "Expired"
  const canRefund = isOwnSwap && swapDetails?.state === 1 && isExpired

  const renderContent = () => {
    if (isLoading) {
      return <CardContent className="grid gap-4"><Skeleton className="h-48 w-full" /></CardContent>
    }
    if (!swapDetails || !tokenInfo) {
      return <CardContent><p className="text-center text-muted-foreground">Swap not found or wallet not connected.</p></CardContent>
    }
    return (
      <>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-around gap-4 rounded-lg border p-4 text-center">
            <div>
              <p className="text-muted-foreground text-sm">You Send</p>
              <p className="text-xl font-bold">
                {isOwnSwap
                  ? `${formattedErcAmount} ${tokenInfo.symbol}`
                  : `${formattedPcAmount} PC`}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-sm">You Receive</p>
              <p className="text-xl font-bold">
                {isOwnSwap
                  ? `${formattedPcAmount} PC`
                  : `${formattedErcAmount} ${tokenInfo.symbol}`}
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Info size={16} /> Details</h3>
            <DetailRow label="Status">
              <Badge variant={swapDetails.state === 1 ? "outline" : "secondary"}>{states[swapDetails.state]}</Badge>
            </DetailRow>
            <DetailRow label="ERC Token" value={swapDetails.ercToken} isMono />
          </div>
          
          <div className="grid gap-2">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Users size={16} /> Participants</h3>
            <DetailRow label="Initiator (User A)" value={swapDetails.userA} isMono />
            <DetailRow label="Participant (User B)" value={swapDetails.userB === ethers.ZeroAddress ? 'Not yet participated' : swapDetails.userB} isMono />
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Lock size={16} /> Hashes</h3>
            <DetailRow label="Hash A" value={swapDetails.hashA} isMono />
            <DetailRow label="Hash B" value={swapDetails.hashB === ethers.ZeroHash ? 'Not yet set' : swapDetails.hashB} isMono />
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Clock size={16} /> Timelock</h3>
            <DetailRow label="Expires On" value={new Date(Number(swapDetails.timelock) * 1000).toLocaleString()} />
            <DetailRow label="Time Remaining" value={timeRemaining} />
          </div>
        </CardContent>
        {swapDetails.state === 1 && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={canRefund ? handleRefund : () => setIsConfirmationOpen(true)}
              disabled={(!canParticipate && !canRefund) || isParticipating || isRefunding || !isInitialized}
              variant={canRefund ? "destructive" : "default"}
            >
              {(isParticipating || isRefunding) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {canRefund
                ? "Refund Swap"
                : isOwnSwap
                ? "This is your swap"
                : "Participate"}
            </Button>
          </CardFooter>
        )}
      </>
    )
  }

  const renderClaimCard = () => {
    if (!swapDetails || (swapDetails.state !== 2 && swapDetails.state !== 3)) {
      return null
    }

    let title = ""
    let description = ""
    let buttonText = ""
    let actionHandler: (() => void) | undefined = undefined
    let buttonVariant: "default" | "destructive" = "default"
    let actionInProgress = isClaiming

    if (isOwnSwap) { // User A
      if (swapDetails.state === 2) {
        if (isExpired) {
            title = "Swap Expired"
            description = "The participant did not claim the swap in time. You can now refund both your and the participant's funds."
            buttonText = "Refund Locked Swap"
            actionHandler = handleRefundLockedSwap
            buttonVariant = "destructive"
            actionInProgress = isRefunding
        } else {
            title = "Awaiting Participant's Claim"
            description = "The participant (User B) must claim their tokens first. Once they do, you will be able to claim your PC."
        }
      } else if (swapDetails.state === 3) {
        title = "Claim Your PC"
        description = "The participant has claimed their tokens. You can now claim your PC by revealing their secret."
        buttonText = "Claim PC"
        actionHandler = handleClaim
        actionInProgress = isClaiming
      }
    } else if (isParticipant) { // User B
      if (swapDetails.state === 2) {
        if (isExpired) {
            title = "Swap Expired"
            description = "You did not claim the swap in time. The creator (User A) can now refund the swap."
        } else {
            title = "Claim Your Tokens"
            description = "You can now claim your tokens by revealing the creator's secret. This will complete the swap from your side."
            buttonText = "Claim Tokens"
            actionHandler = handleClaim
            actionInProgress = isClaiming
        }
      } else if (swapDetails.state === 3) {
        title = "Tokens Claimed"
        description = "You have successfully claimed your tokens. The swap is complete."
      }
    } else {
      return null // Not involved in this swap
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {actionHandler && (
          <CardFooter>
            <Button className="w-full" variant={buttonVariant} onClick={actionHandler} disabled={actionInProgress || !isInitialized}>
              {actionInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }

  return (
    <div className="flex justify-center p-4 sm:p-6 lg:p-8">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-4 md:gap-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link href="/home"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="text-xl font-semibold">Swap Details</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Swap Details</CardTitle>
            <CardDescription className="font-mono text-xs break-all">ID: {swapId}</CardDescription>
          </CardHeader>
          {renderContent()}
        </Card>

        {renderClaimCard()}

        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onOpenChange={setIsConfirmationOpen}
          title="Confirm Participation"
          description={`You are about to send ${formattedPcAmount} PC to participate in this swap. Are you sure you want to proceed?`}
          onConfirm={() => {
            setIsConfirmationOpen(false)
            executeParticipation()
          }}
        />
        <StatusModal
          isOpen={modalState.isOpen}
          onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}
          status={modalState.status}
          title={modalState.title}
          description={modalState.description}
          actionLabel={modalState.actionLabel}
          onAction={modalState.onAction}
        />
      </main>
    </div>
  )
}