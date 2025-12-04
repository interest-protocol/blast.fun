import { Aftermath } from "aftermath-ts-sdk";

export const getCoinPrice = async (coinType: string) => {
    const afSdk = new Aftermath("MAINNET");
    await afSdk.init(); // initialize provider

    const prices = afSdk.Prices();

    return prices.getCoinPrice({
        coin: coinType,
    });
};
