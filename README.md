# pushSwap: Peer-to-Peer Atomic Swaps on Pushchain

<img width="2000" height="1000" alt="1" src="https://github.com/user-attachments/assets/246d260a-2cea-4160-9f2f-2713eb21df9d" />


## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Key Features](#2-key-features)
3.  [Technical Stack](#3-technical-stack)
4.  [Getting Started](#4-getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Running the Application](#running-the-application)
5.  [Core User Flows](#5-core-user-flows)
    *   [Wallet Connection](#51-wallet-connection)
    *   [Creating a Swap (User A)](#52-creating-a-swap-user-a)
    *   [Participating in a Swap (User B)](#53-participating-in-a-swap-user-b)
    *   [Claiming a Swap](#54-claiming-a-swap)
    *   [Refunding a Swap](#55-refunding-a-swap)
    *   [Viewing Swaps](#56-viewing-swaps)
6.  [Future Improvements: Cross-Chain P2P Swaps](#6-future-improvements-cross-chain-p2p-swaps)
7.  [Contributing](#7-contributing)
8.  [License](#8-license)

---

## 1. Project Overview

pushSwap is a decentralized application (dApp) built on the Pushchain network, designed to facilitate secure and trustless peer-to-peer (P2P) atomic swaps. It enables users to exchange ERC-20 compatible tokens for native PC tokens directly, leveraging Hash Time-Locked Contracts (HTLCs). This mechanism ensures that either both parties receive their intended assets or neither does, effectively eliminating counterparty risk and the need for centralized intermediaries.

The application prioritizes decentralization, trustlessness, and user empowerment, offering a streamlined and transparent platform for digital asset exchange.

## 2. Key Features

*   **Swap Creation:** Users can initiate a swap by specifying the ERC-20 token on PushChain and amount they wish to send, and the corresponding PC amount they wish to receive.
*   **Swap Participation:** Other users can browse available swaps and participate by matching the requested PC amount.
*   **Atomic Claims:** A secure mechanism for both parties to claim their swapped assets using cryptographic secrets.
*   **Time-Locked Refunds:** A built-in safety mechanism allowing the initiator to reclaim their funds if a swap is not completed within a specified timeframe.
*   **Dashboard & Tracking:** A user-friendly interface to view open swaps, as well as swaps created by and participated in by the current user.
*   **Multiple Token Pairs:** Support for various ERC-20 tokens to be swapped against native PC tokens.

## 3. Technical Stack

pushSwap is built with a modern and robust technology stack:

*   **Frontend Framework:** Next.js (App Router)
*   **Programming Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Component Library:** shadcn/ui (built on Radix UI)
*   **Icons:** lucide-react
*   **Form Management:** React Hook Form
*   **Blockchain Interaction:** @pushchain/ui-kit, ethers.js, viem
*   **State Management:** React's built-in hooks (useState, useEffect, useCallback)

## 4. Getting Started

Follow these instructions to set up and run the pushSwap application locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or Yarn
*   A web3 wallet (e.g., MetaMask) connected to the Pushchain Testnet.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd pushswap
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:3000`.

## 5. Core User Flows

This section details the primary user interactions within the pushSwap application.

### 5.1. Wallet Connection

The initial step for any user to interact with the pushSwap dApp.

```
+---------------------+
|     Welcome Page    |
| (app/page.tsx)      |
| - Displays logo,    |
|   description       |
| - PushUniversal     |
|   Account Button    |
+---------------------+
          |
          | 1. User clicks "Connect Wallet"
          |    (via PushUniversalAccountButton)
          V
+---------------------+
|   Wallet Provider   |
| (components/wallet-provider.tsx)
| - Initializes PushChainClient
| - Handles wallet connection logic
+---------------------+
          |
          | 2. Wallet connection successful
          |    (isInitialized becomes true)
          V
+---------------------+
|   Router Redirect   |
| (Next.js useRouter) |
| - Redirects to /home|
+---------------------+
          |
          V
+---------------------+
|     Home Page       |
| (app/home/page.tsx) |
| - Displays metrics, |
|   swap forms, etc.  |
+---------------------+
```

### 5.2. Creating a Swap (User A)

User A initiates a new swap, locking their ERC-20 tokens and defining the terms.

```
+---------------------+
|     Home Page       |
| (Create Swap Tab)   |
| (components/swap-form.tsx)
+---------------------+
          |
          | 1. User A inputs ERC-20 amount, selects token,
          |    and inputs desired PC amount.
          | 2. Clicks "Create Swap".
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Preparing Swap..."
| Desc: "Generating secrets and preparing your transaction."
+---------------------+
          |
          | 3. App generates `secretA` (random 32 bytes)
          |    and `hashA` (keccak256 of `secretA`).
          | 4. App initiates ERC-20 `approve` transaction
          |    to allow HTLCSwap contract to spend `sendAmount`.
          V
+---------------------+
|   Wallet Prompt     |
| (Approve ERC-20)    |
+---------------------+
          |
          | 5. User A confirms approval in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Awaiting Approval"
| Desc: "Please approve the token spending in your wallet."
+---------------------+
          |
          | 6. ERC-20 approval transaction confirmed on-chain.
          | 7. App initiates `createSwap` transaction on HTLCSwap contract.
          V
+---------------------+
|   Wallet Prompt     |
| (Create Swap Tx)    |
+---------------------+
          |
          | 8. User A confirms `createSwap` transaction in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Creating Swap"
| Desc: "Token approved. Please confirm the swap creation transaction."
+---------------------+
          |
          | 9. `createSwap` transaction confirmed on-chain.
          V
+---------------------+
|   Status Modal      |
| (Status: Success)   |
| Title: "Swap Created Successfully!"
| Desc: "Your swap has been created. IMPORTANT: Save your secret! [secretA]"
| Action: "View on Explorer"
+---------------------+
```

### 5.3. Participating in a Swap (User B)

User B discovers an open swap and commits their PC tokens to participate.

```
+---------------------+
|     Home Page       |
| (Open Swaps Tab)    |
| (components/open-swaps.tsx)
+---------------------+
          |
          | 1. User B browses available swaps.
          | 2. Clicks "View Swap" for a specific swap.
          V
+---------------------+
|   Swap Details Page |
| (app/swap/[id]/page.tsx)
| - Displays swap details (state: OPEN)
+---------------------+
          |
          | 3. User B clicks "Participate".
          V
+---------------------+
| Confirmation Modal  |
| (components/confirmation-modal.tsx)
| Title: "Confirm Participation"
| Desc: "You are about to send [PC amount] PC to participate..."
+---------------------+
          |
          | 4. User B confirms.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Preparing Swap"
| Desc: "Generating secrets and preparing your transaction..."
+---------------------+
          |
          | 5. App generates `secretB` (random 32 bytes)
          |    and `hashB` (keccak256 of `secretB`).
          | 6. App initiates `participateSwap` transaction on HTLCSwap contract,
          |    sending `pcAmount` as value.
          V
+---------------------+
|   Wallet Prompt     |
| (Deposit PC)        |
+---------------------+
          |
          | 7. User B confirms transaction in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Transaction"
| Desc: "Your transaction is being processed on the network..."
+---------------------+
          |
          | 8. `participateSwap` transaction confirmed on-chain.
          V
+---------------------+
|   Status Modal      |
| (Status: Success)   |
| Title: "Participation Successful!"
| Desc: "You have successfully joined the swap. IMPORTANT: Save your secret! [secretB]"
| Action: "View on Explorer"
+---------------------+
```

### 5.4. Claiming a Swap

The process by which participants retrieve their swapped assets.

**Scenario A: User B Claims ERC-20 (First Claim)**
User B uses `secretA` (revealed by User A) to claim the ERC-20 tokens.

```
+---------------------+
|   Swap Details Page |
| (app/swap/[id]/page.tsx)
| (Swap State: LOCKED)
+---------------------+
          |
          | 1. User B clicks "Claim Tokens".
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Claim"
| Desc: "Fetching secret from contract..."
+---------------------+
          |
          | 2. App calls `getHashToReveal` on HTLCSwap contract
          |    to retrieve `secretA` (which User A revealed).
          | 3. App initiates `claimByUserB` transaction with `secretA`.
          V
+---------------------+
|   Wallet Prompt     |
| (Claim ERC-20)      |
+---------------------+
          |
          | 4. User B confirms transaction in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Transaction"
| Desc: "Your transaction is being processed..."
+---------------------+
          |
          | 5. `claimByUserB` transaction confirmed on-chain.
          V
+---------------------+
|   Status Modal      |
| (Status: Success)   |
| Title: "Claim Successful!"
| Desc: "Your funds have been successfully claimed."
| Action: "View on Explorer"
+---------------------+
```

**Scenario B: User A Claims PC (Second Claim)**
User A uses `secretB` (revealed by User B's claim) to claim the PC tokens.

```
+---------------------+
|   Swap Details Page |
| (app/swap/[id]/page.tsx)
| (Swap State: CLAIMEDBYB)
+---------------------+
          |
          | 1. User A clicks "Claim PC".
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Claim"
| Desc: "Fetching secret from contract..."
+---------------------+
          |
          | 2. App calls `getHashToReveal` on HTLCSwap contract
          |    to retrieve `secretB` (which User B revealed).
          | 3. App initiates `claimByUserA` transaction with `secretB`.
          V
+---------------------+
|   Wallet Prompt     |
| (Claim PC)          |
+---------------------+
          |
          | 4. User A confirms transaction in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Transaction"
| Desc: "Your transaction is being processed..."
+---------------------+
          |
          | 5. `claimByUserA` transaction confirmed on-chain.
          V
+---------------------+
|   Status Modal      |
| (Status: Success)   |
| Title: "Claim Successful!"
| Desc: "Your funds have been successfully claimed."
| Action: "View on Explorer"
+---------------------+
```

### 5.5. Refunding a Swap

A safety mechanism to retrieve locked funds if a swap is not completed.

**Scenario A: User A Refunds (Swap OPEN and Expired)**
If User B does not participate before the timelock expires.

```
+---------------------+
|   Swap Details Page |
| (app/swap/[id]/page.tsx)
| (Swap State: OPEN, Expired)
+---------------------+
          |
          | 1. User A clicks "Refund Swap".
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Refund"
| Desc: "Please confirm the transaction in your wallet."
+---------------------+
          |
          | 2. App initiates `refundSwap` transaction on HTLCSwap contract.
          V
+---------------------+
|   Wallet Prompt     |
| (Refund Tx)         |
+---------------------+
          |
          | 3. User A confirms transaction in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Transaction"
| Desc: "Your transaction is being processed..."
+---------------------+
          |
          | 4. `refundSwap` transaction confirmed on-chain.
          V
+---------------------+
|   Status Modal      |
| (Status: Success)   |
| Title: "Refund Successful!"
| Desc: "Your funds have been returned to your wallet."
| Action: "View on Explorer"
+---------------------+
```

**Scenario B: User A Refunds Locked Swap (Swap LOCKED and Expired)**
If User B participated but failed to claim their ERC-20 tokens before the timelock expired.

```
+---------------------+
|   Swap Details Page |
| (app/swap/[id]/page.tsx)
| (Swap State: LOCKED, Expired)
+---------------------+
          |
          | 1. User A clicks "Refund Locked Swap".
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Refund"
| Desc: "Please confirm the transaction in your wallet."
+---------------------+
          |
          | 2. App initiates `refundLockedSwap` transaction on HTLCSwap contract.
          V
+---------------------+
|   Wallet Prompt     |
| (Refund Tx)         |
+---------------------+
          |
          | 3. User A confirms transaction in wallet.
          V
+---------------------+
|   Status Modal      |
| (Status: Loading)   |
| Title: "Processing Transaction"
| Desc: "Your transaction is being processed..."
+---------------------+
          |
          | 4. `refundLockedSwap` transaction confirmed on-chain.
          V
+---------------------+
|   Status Modal      |
| (Status: Success)   |
| Title: "Refund Successful!"
| Desc: "The locked funds have been returned to both parties."
| Action: "View on Explorer"
+---------------------+
```

### 5.6. Viewing Swaps

Users can monitor the status of all swaps they are involved in.

```
+---------------------+
|     Home Page       |
| (My Swaps Tab)      |
| (components/user-swaps.tsx)
+---------------------+
          |
          | 1. User selects "Created" or "Participated" tab.
          |    (Tabs component)
          V
+---------------------+
|     Swap Table      |
| - Fetches user's    |
|   created/participated swaps
| - Displays ID, amounts, status, and action buttons
| - Action button links to Swap Details Page
+---------------------+
```

## 6. Future Improvements: Cross-Chain P2P Swaps

The current pushSwap implementation provides robust P2P atomic swaps within the Pushchain network. A significant future enhancement involves extending this functionality to **cross-chain peer-to-peer atomic swaps**. This would allow users to exchange assets directly between different blockchain networks, greatly expanding the utility and reach of pushSwap.

**Vision:**
To enable seamless, trustless swaps between assets on Pushchain and other major blockchain networks (e.g., Ethereum, Polygon, Solana), without relying on centralized bridges or exchanges.

**Technical Considerations & Proposed Architecture:**

1.  **Interoperability Layer Integration:**
    *   **Challenge:** Direct atomic swaps between chains with disparate architectures (e.g., EVM vs. Solana) are complex.
    *   **Solution:** Integrate with a generalized cross-chain messaging protocol such as LayerZero, Wormhole, or Axelar. These protocols provide the secure communication infrastructure necessary for contracts on one chain to verify events and trigger actions on another.
    *   **Mechanism:** The HTLC logic would be deployed on both participating chains. An initiation on Chain A would send a message via the interoperability layer to Chain B, instructing its HTLC contract to lock funds for the counterparty. The subsequent reveal of the secret on one chain would then be relayed to the other to unlock the corresponding funds.

    ```
    +----------+     +---------------------+     +---------------------+     +----------+
    |  User A  |     |  Chain A (Pushchain)|     |  Chain B (e.g., ETH)|     |  User B  |
    | (ERC-20) |     | (HTLC Contract A)   |     | (HTLC Contract B)   |     | (Native) |
    +----------+     +---------------------+     +---------------------+     +----------+
         |                    |                             |                    |
         | 1. Initiates swap  |                             |                    |
         |    (locks ERC-20 on Chain A)                     |                    |
         |------------------->|                             |                    |
         |                    |                             |                    |
         |                    | 2. Cross-Chain Message      |                    |
         |                    |    (via Interop. Layer)     |                    |
         |                    |---------------------------->|                    |
         |                    |                             |                    | 3. Locks Chain B native
         |                    |                             |                    |    (HTLC Contract B)
         |                    |                             |                    |<-------------------|
         |                    |                             |                    |
         |                    |                             | 4. User B claims   |
         |                    |                             |    (reveals secretB)|
         |                    |                             |<-------------------|
         |                    |                             |
         |                    | 5. Cross-Chain Message      |                    |
         |                    |    (secretB reveal)         |                    |
         |                    |<----------------------------|                    |
         |                    |                             |                    |
         | 6. User A claims   |                             |                    |
         |    (uses secretB)  |                             |                    |
         |<-------------------|                             |                    |
    ```

2.  **Multi-Chain Smart Contract Deployments:**
    *   **Challenge:** The existing HTLCSWAP contract is tailored for Pushchain.
    *   **Solution:** Deploy compatible HTLC contracts on each target blockchain. These contracts would need to be adapted to handle the native token of their respective chains and the specific ERC-20 tokens involved in the swap.

3.  **Enhanced UI for Chain Selection:**
    *   **Challenge:** The current user interface is designed with Pushchain as the implicit network.
    *   **Solution:** Implement a clear and intuitive chain selection mechanism within the swap creation and participation flows. This would allow users to easily specify the "send" and "receive" chains, dynamically updating available tokens and estimated transaction fees.

4.  **Oracle/Relayer Network for Timelocks:**
    *   **Challenge:** Ensuring reliable timelock expirations and refund mechanisms across different chains, especially considering potential network congestion or varying block times.
    *   **Solution:** Explore integration with decentralized oracle networks or a dedicated relayer service. These services could monitor swap states across chains and automatically trigger refunds or claims if manual action is delayed or missed, enhancing the robustness of the system.

5.  **Comprehensive Security Audits:**
    *   **Challenge:** Cross-chain interactions introduce new complexities and potential attack vectors.
    *   **Solution:** Rigorous security audits and, where feasible, formal verification of all cross-chain smart contracts and messaging logic will be paramount to ensure the integrity and security of the system before any production deployment.
---
**Built with love by, 0xanoop.**
