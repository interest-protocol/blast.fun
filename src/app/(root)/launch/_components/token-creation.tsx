import z from "zod";

const tokenSchema = z.object({
    name: z.string().max(20),
    symbol: z.string().max(10),
    desc: z.string().max(256),
    website: z.url().optional(),
    telegram: z.url().optional(),
    twitter: z.url().optional()
})

export default function TokenCreationForm() {
    // 


}