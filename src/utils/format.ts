import BigNumber from "bignumber.js";

export const formatAmount = (amount: string | number | bigint | undefined) => {
    if (amount == null) {
        return undefined;
    }

    let bn = new BigNumber(amount.toString());
    bn = bn.shiftedBy(-9);

    return bn.decimalPlaces(2, BigNumber.ROUND_DOWN).toFormat(2);
};

export const formatNumber = (num: number | string | undefined, decimals: number = 2): string => {
    if (num == null) return '0';
    
    const value = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(value)) return '0';
    
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(decimals)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(decimals)}K`;
    }
    
    return value.toFixed(decimals);
};

export const formatAddress = (address: string | undefined): string => {
    if (!address) return '[UNKNOWN]';
    
    if (address.length <= 10) return address;
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
