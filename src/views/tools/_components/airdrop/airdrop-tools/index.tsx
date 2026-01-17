"use client"

import { FC, useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import toast from "react-hot-toast"
import { AirdropRecipient } from "./airdrop-tools.types"
import { useFetchCoins } from "./_hooks/use-fetch-coins"
import { useResolveCsv } from "./_hooks/use-resolve-csv"
import AirdropConfig from "./_components/airdrop-config"
import AirdropPreview from "./_components/airdrop-preview"
import RecipientsPreview from "./_components/recipients-preview"
import { useAirdrop } from "../_hooks/use-airdrop"

const AirdropTools: FC = () => {
  const { address, setIsConnectDialogOpen } = useApp()

  const [selectedCoin, setSelectedCoin] = useState<string>("")
  const [csvInput, setCsvInput] = useState<string>(
    "example.sui,0.001\n0x0000000000000000000000000000000000000000000000000000000000000000,0.001"
  )
  const [debouncedCsvInput, setDebouncedCsvInput] = useState<string>(csvInput)
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([])
  const [isResolvingAddresses, setIsResolvingAddresses] = useState(false)

  const { coins, loading: isLoadingCoins } = useFetchCoins(address ?? "")
  const { resolveCsv, resolving } = useResolveCsv()

  const {
    handleAirdrop,
    isRecoveringGas,
    isAirdropComplete,
    lastCsvInput,
    delegatorAddress,
    airdropProgress,
    isProcessing,
  } = useAirdrop({ address, selectedCoin, recipients, csvInput })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCsvInput(csvInput), 500)
    return () => clearTimeout(timer)
  }, [csvInput])

  useEffect(() => {
    if (!isLoadingCoins && coins.length > 0 && !selectedCoin) {
      setSelectedCoin(coins[0].coinType)
    }
  }, [isLoadingCoins, coins, selectedCoin])

  useEffect(() => {
    if (!debouncedCsvInput.trim()) {
      setRecipients([])
      return
    }

    let mounted = true
    const parseAndResolve = async () => {
      setIsResolvingAddresses(true)
      try {
        const parsed = await resolveCsv(debouncedCsvInput)
        if (!mounted) return
        setRecipients(parsed)
      } catch (err) {
        console.error("parseAndResolve error:", err)
        toast.error("Failed to parse recipients")
      } finally {
        if (mounted) setIsResolvingAddresses(false)
      }
    }

    parseAndResolve()
    return () => {
      mounted = false
    }
  }, [debouncedCsvInput, resolveCsv])

  const selectedCoinInfo = useMemo(() => coins.find((c) => c.coinType === selectedCoin), [coins, selectedCoin])

  const totalAmount = useMemo(
    () => recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0),
    [recipients]
  )

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">WALLET NOT CONNECTED</p>
        <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">CONNECT YOUR WALLET TO ACCESS AIRDROP TOOLS</p>
        <Button onClick={() => setIsConnectDialogOpen(true)} className="font-mono uppercase tracking-wider mt-6" variant="outline">
          CONNECT WALLET
        </Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4 lg:h-full lg:min-h-0">
      <div className="lg:col-span-2 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden">
        <AirdropConfig
          coins={coins}
          isLoadingCoins={isLoadingCoins}
          selectedCoin={selectedCoin}
          onSelectCoin={(c) => setSelectedCoin(c)}
          csvInput={csvInput}
          onChangeCsv={(v) => setCsvInput(v)}
          linesCount={csvInput.split("\n").filter((l) => l.trim()).length}
        />
      </div>

      <div className="lg:col-span-1 lg:flex lg:flex-col gap-4 lg:min-h-0 lg:overflow-hidden">
        <AirdropPreview
          selectedCoinInfo={selectedCoinInfo}
          recipients={recipients}
          totalAmount={totalAmount}
          isRecoveringGas={isRecoveringGas}
          isAirdropComplete={isAirdropComplete}
          lastCsvInput={lastCsvInput}
          csvInput={csvInput}
          delegatorAddress={delegatorAddress}
          airdropProgress={airdropProgress}
          isProcessing={isProcessing}
          handleAirdrop={handleAirdrop}
        />

        {recipients.length > 0 && (
          <RecipientsPreview recipients={recipients} isResolving={isResolvingAddresses || resolving} totalAmount={totalAmount} />
        )}
      </div>
    </div>
  )
}

export default AirdropTools
