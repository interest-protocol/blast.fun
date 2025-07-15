"use client";

import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { TokenFormValues } from "./create-token-form";
import { Button } from "@/components/ui/button";
import { useLaunchCoin } from "../_hooks/use-launch-coin";

interface CreateTokenButtonnProps {
    form: UseFormReturn<TokenFormValues>;
}

export default function CreateTokenButton({ form }: CreateTokenButtonnProps) {
    const { isCreating, launchToken } = useLaunchCoin();

    const onSubmit = async (data: TokenFormValues) => {
        await launchToken(data);
        form.reset();
    };

    return (
        <Button
            type="submit"
            className="w-full"
            disabled={isCreating || !form.formState.isValid}
            onClick={form.handleSubmit(onSubmit)}
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