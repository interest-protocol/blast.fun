'use client'

import React, { useState } from 'react'
import { AlertCircle, ArrowUpDown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { pumpSdk } from '@/lib/pump'
import { formatNumber } from '@/utils/format'
import type { PoolWithMetadata } from '@/types/pool'
import useBalance from '@/hooks/sui/use-balance'
import { useTokenBalance } from '@/hooks/sui/use-token-balance'
import { useTransaction } from '@/hooks/sui/use-transaction'
import { useApp } from '@/context/app.context'

interface TradingPanelProps {
    pool: PoolWithMetadata
}

export function TradingPanel({ pool }: TradingPanelProps) {
    const { wallet, isConnected } = useApp()
    const { executeTransaction } = useTransaction()
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState('')
    const [slippage, setSlippage] = useState('1')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { balance: suiBalance } = useBalance()
    const { balance: tokenBalance } = useTokenBalance(pool.coinType)

    const metadata = pool.coinMetadata
    const decimals = metadata?.decimals || 9

    const handleTrade = async () => {
        if (!isConnected || !wallet) {
            setError('WALLET::NOT_CONNECTED')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('AMOUNT::INVALID')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const amountInDecimals = Math.floor(parseFloat(amount) * Math.pow(10, decimals))
            const slippageBps = Math.floor(parseFloat(slippage) * 100) // Convert percentage to basis points

            if (tradeType === 'buy') {
                // Using pump method (buy)
                const tx = await pumpSdk.pump({
                    poolId: pool.poolId,
                    quoteAmount: amountInDecimals,
                    minOutputAmount: 0, // Will calculate based on slippage
                    slippageBps,
                })

                await executeTransaction(tx)
                setAmount('')
            } else {
                // Using dump method (sell)
                const tx = await pumpSdk.dump({
                    poolId: pool.poolId,
                    coinAmount: amountInDecimals,
                    minQuoteAmount: 0, // Will calculate based on slippage
                    slippageBps,
                })

                await executeTransaction(tx)
                setAmount('')
            }
        } catch (err) {
            setError(`ERROR::${err instanceof Error ? err.message : 'UNKNOWN_ERROR'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const maxAmount = tradeType === 'buy' 
        ? formatNumber(Number(suiBalance || 0) / Math.pow(10, 9), 4)
        : formatNumber(Number(tokenBalance || 0) / Math.pow(10, decimals), 4)

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl sticky top-4">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-mono uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    TRADE::TERMINAL
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
                    <TabsList className="grid w-full grid-cols-2 bg-background/50">
                        <TabsTrigger 
                            value="buy" 
                            className="font-mono uppercase data-[state=active]:bg-green-500/20"
                        >
                            PUMP::BUY
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sell"
                            className="font-mono uppercase data-[state=active]:bg-red-500/20"
                        >
                            DUMP::SELL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={tradeType} className="space-y-4 mt-6">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <Label className="font-mono text-xs uppercase text-muted-foreground">
                                AMOUNT::{tradeType === 'buy' ? 'SUI' : metadata?.symbol || 'TOKEN'}
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="font-mono pr-16"
                                    disabled={isLoading}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-7 font-mono text-xs uppercase"
                                    onClick={() => setAmount(maxAmount)}
                                >
                                    MAX
                                </Button>
                            </div>
                            <p className="font-mono text-xs uppercase text-muted-foreground">
                                BALANCE::{maxAmount} {tradeType === 'buy' ? 'SUI' : metadata?.symbol}
                            </p>
                        </div>

                        {/* Slippage Settings */}
                        <div className="space-y-2">
                            <Label className="font-mono text-xs uppercase text-muted-foreground">
                                SLIPPAGE::TOLERANCE
                            </Label>
                            <Select value={slippage} onValueChange={setSlippage}>
                                <SelectTrigger className="font-mono">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.5" className="font-mono">0.5%</SelectItem>
                                    <SelectItem value="1" className="font-mono">1.0%</SelectItem>
                                    <SelectItem value="2.5" className="font-mono">2.5%</SelectItem>
                                    <SelectItem value="5" className="font-mono">5.0%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive" className="font-mono">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle className="uppercase">ERROR::TRANSACTION</AlertTitle>
                                <AlertDescription className="text-xs uppercase">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Trade Button */}
                        <Button
                            className={`w-full font-mono uppercase tracking-wider ${
                                tradeType === 'buy' 
                                    ? 'bg-green-500/20 hover:bg-green-500/30' 
                                    : 'bg-red-500/20 hover:bg-red-500/30'
                            }`}
                            size="lg"
                            onClick={handleTrade}
                            disabled={!isConnected || isLoading || !amount}
                        >
                            {isLoading ? (
                                <>PROCESSING::TRANSACTION</>
                            ) : !isConnected ? (
                                <>WALLET::NOT_CONNECTED</>
                            ) : (
                                <>EXECUTE::{tradeType === 'buy' ? 'PUMP' : 'DUMP'}</>
                            )}
                        </Button>

                        {/* Price Impact Warning */}
                        {amount && parseFloat(amount) > 0 && (
                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground">
                                    <span>PRICE::IMPACT</span>
                                    <span className="text-yellow-500">~0.5%</span>
                                </div>
                                <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground">
                                    <span>FEE::PROTOCOL</span>
                                    <span>0.3%</span>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Swap Direction Helper */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-background"
                            onClick={() => setTradeType(tradeType === 'buy' ? 'sell' : 'buy')}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}