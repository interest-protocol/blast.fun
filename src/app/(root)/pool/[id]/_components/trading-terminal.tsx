'use client'

import React, { useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PoolWithMetadata } from '@/types/pool'
import { useTokenBalance } from '@/hooks/sui/use-token-balance'
import { useApp } from '@/context/app.context'
import { usePump } from '@/hooks/pump/use-pump'

interface TradingTerminalProps {
    pool: PoolWithMetadata
}

export function TradingTerminal({ pool }: TradingTerminalProps) {
    const { isConnected } = useApp()
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState('')
    const [slippage, setSlippage] = useState('15')

    const { balance: tokenBalance } = useTokenBalance(pool.coinType)
    const metadata = pool.coinMetadata
    const decimals = metadata?.decimals || 9

    const { isLoading, error, pump, dump } = usePump({
        pool,
        decimals
    })

    // quick buy amounts in SUI
    const quickBuyAmounts = [0.5, 1, 5, 10]

    // quick sell percentages
    const quickSellPercentages = [25, 50, 100]

    const handleQuickBuy = async (suiAmount: number) => {
        setAmount(suiAmount.toString())

        await pump(suiAmount.toString())
        setAmount('')
    }

    const handleQuickSellPercentage = async (percentage: number) => {
        const tokenAmount = (Number(tokenBalance || 0) / Math.pow(10, decimals)) * (percentage / 100)
        setAmount(tokenAmount.toString())

        await dump(tokenAmount.toString())
        setAmount('')
    }

    const handleTrade = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            return
        }

        if (tradeType === 'buy') {
            await pump(amount)
        } else {
            await dump(amount)
        }

        setAmount('')
    }

    return (
        <div className="border-2 bg-background/50 backdrop-blur-sm rounded-lg">
            <div className="p-4 border-b">
                <h3 className="text-lg font-mono uppercase tracking-wider">
                    TRADE::TERMINAL
                </h3>
            </div>

            <div className="p-4 space-y-4">
                <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
                    <TabsList className="grid w-full grid-cols-2 bg-background/50">
                        <TabsTrigger
                            value="buy"
                            className="font-mono uppercase data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
                        >
                            BUY
                        </TabsTrigger>
                        <TabsTrigger
                            value="sell"
                            className="font-mono uppercase data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
                        >
                            SELL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={tradeType} className="space-y-4 mt-4">
                        {/* Quick Buy Buttons - Only show for buy tab */}
                        {tradeType === 'buy' && (
                            <div className="grid grid-cols-4 gap-2">
                                {quickBuyAmounts.map((quickAmount) => (
                                    <Button
                                        key={quickAmount}
                                        variant="outline"
                                        size="sm"
                                        className="font-mono text-xs border-border/50 hover:border-green-500/50 hover:text-green-500"
                                        onClick={() => handleQuickBuy(quickAmount)}
                                        disabled={isLoading || !isConnected}
                                    >
                                        {quickAmount} SUI
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Quick Sell Percentage Buttons - Only show for sell tab */}
                        {tradeType === 'sell' && (
                            <div className="grid grid-cols-3 gap-2">
                                {quickSellPercentages.map((percentage) => (
                                    <Button
                                        key={percentage}
                                        variant="outline"
                                        size="sm"
                                        className="font-mono text-xs border-border/50 hover:border-red-500/50 hover:text-red-500"
                                        onClick={() => handleQuickSellPercentage(percentage)}
                                        disabled={isLoading || !isConnected || !tokenBalance}
                                    >
                                        {percentage}%
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder={tradeType === 'buy' ? "Amount in SUI" : `Amount in ${metadata?.symbol || 'TOKEN'}`}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="font-mono focus:border-primary/50"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Slippage Settings - Collapsible */}
                        <details className="group">
                            <summary className="cursor-pointer font-mono text-xs uppercase text-muted-foreground hover:text-foreground">
                                SLIPPAGE::{slippage}%
                            </summary>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                                {['5', '10', '15', '20'].map((value) => (
                                    <Button
                                        key={value}
                                        variant={slippage === value ? 'secondary' : 'outline'}
                                        size="sm"
                                        className="font-mono text-xs"
                                        onClick={() => setSlippage(value)}
                                    >
                                        {value}%
                                    </Button>
                                ))}
                            </div>
                        </details>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive" className="py-2">
                                <AlertDescription className="font-mono text-xs">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Trade Button */}
                        <Button
                            className={`w-full font-mono uppercase tracking-wider transition-all duration-300 ${tradeType === 'buy'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            size="lg"
                            onClick={handleTrade}
                            disabled={!isConnected || isLoading || !amount}
                        >
                            {isLoading ? (
                                <>PROCESSING...</>
                            ) : !isConnected ? (
                                <>CONNECT WALLET</>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    {tradeType === 'buy' ? 'BUY' : 'SELL'} {metadata?.symbol || 'TOKEN'}
                                </>
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}