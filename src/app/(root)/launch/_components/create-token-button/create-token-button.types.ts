import { UseFormReturn } from "react-hook-form";
import { TokenFormValues } from "../create-token-form/create-token-form.types";

export interface CreateTokenButtonProps {
    form: UseFormReturn<TokenFormValues>;
}
