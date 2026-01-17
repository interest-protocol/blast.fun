import z from "zod"
import { tokenSchema } from "./create-token-form.utils"

export type TokenFormValues = z.infer<typeof tokenSchema>

export interface CreateTokenFormProps {
	onFormChange?: (values: Partial<TokenFormValues>) => void
}
