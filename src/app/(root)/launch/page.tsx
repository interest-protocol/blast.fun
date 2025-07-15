"use client";

import { useWallet } from "@/context/wallet.context";
import CreateTokenForm from "./_components/create-token-form";
import { useTwitter } from "@/context/twitter.context";
import { AuthenticationDialog } from "@/components/dialogs/AuthenticationDialog";
import { WalletList } from '@/components/shared/wallet-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LaunchPage() {
    const { isConnected, isConnecting, connect } = useWallet();
    const { isLoggedIn, login } = useTwitter();

    if (!isConnected) {
        return (
            <div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6">
                {isConnecting && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Card className="border-0 shadow-none bg-transparent">
                            <CardContent className="flex flex-col items-center space-y-4 pt-6">
                                <div className="relative">
                                    <RefreshCw className="h-12 w-12 animate-spin text-primary" />
                                    <div className="absolute inset-0 animate-ping">
                                        <RefreshCw className="h-12 w-12 text-primary opacity-20" />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    Connecting to wallet...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card className="w-full border-2 shadow-xl">
                    <CardHeader className="text-center space-y-6">
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Connect Your Wallet
                            </CardTitle>
                            <CardDescription className="text-base max-w-md mx-auto">
                                You need to connect a wallet to launch new coins. Select your preferred wallet from the options below.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <WalletList
                            onSelect={connect}
                            isConnecting={isConnecting}
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isLoggedIn) {
        return (
            <div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6">
                {isConnecting && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Card className="border-0 shadow-none bg-transparent">
                            <CardContent className="flex flex-col items-center space-y-4 pt-6">
                                <div className="relative">
                                    <RefreshCw className="h-12 w-12 animate-spin text-primary" />
                                    <div className="absolute inset-0 animate-ping">
                                        <RefreshCw className="h-12 w-12 text-primary opacity-20" />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    Connecting to wallet...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card className="w-full border-2 shadow-xl">
                    <CardHeader className="text-center space-y-6">
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Connect Your X/Twitter
                            </CardTitle>
                            <CardDescription className="text-base max-w-md mx-auto">
                                You need to sign in with X/Twitter to launch coins. When creating tokens you can choose to hide your identity.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={login}>
                            Connect with X/Twitter
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center space-y-2">
            <h1 className="text-4xl font-bold font-mono uppercase">Launch Your Coin</h1>

            <CreateTokenForm />
        </div>
    );
}