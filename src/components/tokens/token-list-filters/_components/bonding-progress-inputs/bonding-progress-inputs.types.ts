export interface BondingProgressInputsProps {
    min?: number;
    max?: number;
    onChangeMin: (v: number | undefined) => void;
    onChangeMax: (v: number | undefined) => void;
}