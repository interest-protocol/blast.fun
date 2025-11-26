import { UseFormReturn } from "react-hook-form"
import { TokenFormValues } from "../create-token-form"

export interface CreateTokenButtonProps {
	form: UseFormReturn<TokenFormValues>
}
