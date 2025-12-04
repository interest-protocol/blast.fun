"use client"

import { FC } from "react"
import { useApp } from "@/context/app.context"

import ActionTabs from "./_components/action-tabs"
import ConnectWallet from "./_components/connect-wallet"
import BalanceHeader from "./_components/balance-header"
import AmountInput from "./_components/amount-input"
import QuickAmounts from "./_components/quick-amounts"
import { FarmTerminalProps } from "./farm-terminal.types"
import FarmTerminalButton from "./_components/farm-terminal-button"
import useFarmTerminal from "./_hooks/use-farm-terminal"

const FarmTerminal: FC<FarmTerminalProps> = ({ farm, account, metadata, onOperationSuccess }) => {
    const { isConnected, setIsConnectDialogOpen } = useApp()

    const {
        actionType,
        setActionType,
        amount,
        setAmount,
        tokenBalanceInDisplayUnit,
        stakedInDisplayUnit,
        tokenSymbol,
        isProcessing,
        handleDeposit,
        handleWithdraw,
        handleMaxClick,
        handleQuickAmount,
    } = useFarmTerminal({ farm, account, metadata, onOperationSuccess })

    if (!isConnected) {
        return <ConnectWallet onConnect={() => setIsConnectDialogOpen(true)} />
    }

    return (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <ActionTabs
                actionType={actionType}
                setActionType={setActionType}
                stakedInDisplayUnit={stakedInDisplayUnit}
            />

            <div className="border rounded-lg p-3 sm:p-6 space-y-4 sm:space-y-6 bg-muted/5">
                <BalanceHeader
                    actionType={actionType}
                    disabled={isProcessing}
                    tokenSymbol={tokenSymbol}
                    onMaxClick={handleMaxClick}
                    stakedInDisplayUnit={stakedInDisplayUnit}
                    tokenBalanceInDisplayUnit={tokenBalanceInDisplayUnit}
                    balance={actionType === "deposit" ? tokenBalanceInDisplayUnit : stakedInDisplayUnit}
                />

                <div className="space-y-3 sm:space-y-4">
                    <AmountInput
                        amount={amount}
                        setAmount={setAmount}
                        disabled={isProcessing}
                        tokenSymbol={tokenSymbol}
                        tokenIcon={metadata?.iconUrl || ""}
                    />

                    <QuickAmounts
                        actionType={actionType}
                        onSelect={handleQuickAmount}
                        isProcessing={isProcessing}
                        stakedInDisplayUnit={stakedInDisplayUnit}
                    />
                </div>
            </div>

            <FarmTerminalButton
                amount={amount}
                actionType={actionType}
                tokenSymbol={tokenSymbol}
                isProcessing={isProcessing}
                handleDeposit={handleDeposit}
                handleWithdraw={handleWithdraw}
                stakedInDisplayUnit={stakedInDisplayUnit}
                tokenBalanceInDisplayUnit={tokenBalanceInDisplayUnit}
            />
        </div>
    )
}

export default FarmTerminal