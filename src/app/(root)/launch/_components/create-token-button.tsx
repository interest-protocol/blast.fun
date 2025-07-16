"use client";

import { UseFormReturn } from "react-hook-form";
import { Wallet, Rocket, CheckCircle2 } from "lucide-react";
import { TokenFormValues } from "./create-token-form";
import { Button } from "@/components/ui/button";
import { useLaunchCoin } from "../_hooks/use-launch-coin";
import { cn } from "@/utils";

interface CreateTokenButtonnProps {
    form: UseFormReturn<TokenFormValues>;
}

export default function CreateTokenButton({ form }: CreateTokenButtonnProps) {
    const { isCreating, launchToken, currentStep } = useLaunchCoin();

    const onSubmit = async (data: TokenFormValues) => {
        await launchToken(data);
        form.reset();
    };

    const getButtonContent = () => {
        switch (currentStep) {
            case 'token':
                return (
                    <>
                        <Wallet className="mr-2 h-4 w-4 animate-pulse" />
                        <span className="font-mono uppercase">
                            APPROVE::TOKEN_TX
                            <span className="text-xs ml-2 opacity-60">[1/2]</span>
                        </span>
                    </>
                );
            case 'pool':
                return (
                    <>
                        <Wallet className="mr-2 h-4 w-4 animate-pulse" />
                        <span className="font-mono uppercase">
                            APPROVE::POOL_TX
                            <span className="text-xs ml-2 opacity-60">[2/2]</span>
                        </span>
                    </>
                );
            case 'complete':
                return (
                    <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        <span className="font-mono uppercase">LAUNCH::COMPLETE</span>
                    </>
                );
            default:
                return (
                    <>
                        <Rocket className="mr-2 h-4 w-4" />
                        <span className="font-mono uppercase">LAUNCH::TOKEN</span>
                    </>
                );
        }
    };

    const getButtonVariant = () => {
        return 'default' as const;
    };

    return (
        <div className="space-y-3">
            {isCreating && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs uppercase text-foreground/60">
                        <span>TRANSACTION::PROGRESS</span>
                        <span>{currentStep === 'token' ? '1/2' : currentStep === 'pool' ? '2/2' : '0/2'}</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "absolute inset-y-0 left-0 bg-primary transition-all duration-500",
                                currentStep === 'token' && "w-1/2",
                                currentStep === 'pool' && "w-full",
                                currentStep === 'complete' && "w-full bg-green-500"
                            )}
                        />
                    </div>
                </div>
            )}

            <Button
                type="submit"
                className={cn(
                    "w-full font-mono uppercase tracking-wider",
                    isCreating && "animate-pulse"
                )}
                variant={getButtonVariant()}
                disabled={isCreating || !form.formState.isValid}
                onClick={form.handleSubmit(onSubmit)}
            >
                {getButtonContent()}
            </Button>
        </div>
    );
}