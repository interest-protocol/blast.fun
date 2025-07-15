"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { TokenFormValues } from "./create-token-form";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/wallet.context";
import { useTwitter } from "@/context/twitter.context";

interface CreateTokenButtonnProps {
    form: UseFormReturn<TokenFormValues>;
}

export default function CreateTokenButton({ form }: CreateTokenButtonnProps) {
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateToken = async (data: TokenFormValues) => {
        const createToast = toast.loading('Creating your token...');
        setIsCreating(true);

        try {
            console.log("Creating token with data:", data);

            // @todo: hook up the shit from suicoins
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success("Token created successfully!");
            // form.reset();
        } catch (error) {
            console.error("Error creating token:", error);
            toast.error((error as Error).message || 'Something went wrong, try again.');
        } finally {
            setIsCreating(false);
            toast.dismiss(createToast)
        }
    };

    return (
        <Button
            type="submit"
            className="w-full"
            disabled={isCreating || !form.formState.isValid}
            onClick={form.handleSubmit(handleCreateToken)}
        >
            {isCreating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Token...
                </>
            ) : (
                "Create Token"
            )}
        </Button>
    );
}