export const parseCsvLines = (csv: string): Array<{ addressInput: string; amount: string }> => {
    return csv
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
            const separator = line.includes("\t") ? "\t" : ","
            const parts = line.split(separator).map((p) => p.trim())
            return { addressInput: parts[0] ?? "", amount: parts[1] ?? "" }
        })
}
