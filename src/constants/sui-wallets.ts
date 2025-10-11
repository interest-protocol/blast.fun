export type SuiWallet = {
	title: string
	name: string
	icon: string
	link?: {
		desktop?: string
		mobile?: {
			ios?: string
			android?: string
		}
	}
}

export const SUI_WALLETS: readonly SuiWallet[] = [
	{
		title: "Slush",
		name: "Slush",
		icon: "/wallets/wallet_slush.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
			mobile: {
				ios: "https://apps.apple.com/app/slush-a-sui-wallet/id6476572140",
				android:
					"https://play.google.com/store/apps/details?id=com.mystenlabs.suiwallet",
			},
		},
	},
	{
		title: "OKX",
		name: "OKX Wallet",
		icon: "/wallets/ic_okx.jpeg",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
			mobile: {
				ios: "https://apps.apple.com/app/okx-buy-bitcoin-btc-crypto/id1327268470",
				android:
					"https://play.google.com/store/apps/details?id=com.okinc.okex.gp",
			},
		},
	},
	{
		title: "Suiet",
		name: "Suiet",
		icon: "/wallets/ic_suiet.jpeg",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd",
		},
	},
	{
		title: "Gate",
		name: "Gate Wallet",
		icon: "/wallets/ic_gate.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/gate-wallet/cpmkedoipcpimgecpmgpldfpohjplkpp",
			mobile: {
				ios: "https://apps.apple.com/app/gate-io-trade-btc-eth/id1294998195",
				android:
					"https://play.google.com/store/apps/details?id=com.gateio.gateio",
			},
		},
	},
	{
		title: "Bitget",
		name: "Bitget Wallet",
		icon: "/wallets/ic_bitget.svg",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak",
			mobile: {
				ios: "https://apps.apple.com/app/bitget-trade-bitcoin-crypto/id1442778704",
				android:
					"https://play.google.com/store/apps/details?id=com.bitget.exchange",
			},
		},
	},
	{
		title: "Bybit",
		name: "Bybit Wallet",
		icon: "/wallets/wallet_bybit.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/bybit-wallet/pdliaogehgdbhbnmkklieghmmjkpigpa",
			mobile: {
				ios: "https://apps.apple.com/app/bybit-buy-trade-crypto/id1488296980",
				android: "https://play.google.com/store/apps/details?id=com.bybit.app",
			},
		},
	},
	{
		title: "Ethos",
		name: "Ethos Wallet",
		icon: "/wallets/ic_ethos.png",
	},
	{
		title: "Surf",
		name: "Surf Wallet",
		icon: "/wallets/ic_surf.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/surf-wallet/emeeapjkbcbpbpgaagfchmcgglmebnen",
			mobile: {
				ios: "https://apps.apple.com/app/surf-wallet/id6467386034",
				android:
					"https://play.google.com/store/apps/details?id=com.surf.suiwallet",
			},
		},
	},
	{
		title: "Martian",
		name: "Martian Sui Wallet",
		icon: "/wallets/ic_martian.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/martian-aptos-sui-wallet/efbglgofoippbgcjepnhiblaibcnclgk",
		},
	},
	{
		title: "Nightly",
		name: "Nightly",
		icon: "/wallets/wallet_nightly.webp",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/nightly/fiikommddbeccaoicoejoniammnalkfa?pli=1",
			mobile: {
				ios: "https://apps.apple.com/app/nightly-multichain-wallet/id6444768157",
				android:
					"https://play.google.com/store/apps/details?id=com.nightlymobile",
			},
		},
	},
	{
		title: "TokenPocket",
		name: "TokenPocket Wallet",
		icon: "/wallets/wallet-tp.webp",
		link: {
			desktop: "https://www.tokenpocket.pro/",
			mobile: {
				ios: "https://apps.apple.com/app/tokenpocket-crypto-bitcoin/id6444625622",
				android:
					"https://play.google.com/store/apps/details?id=vip.mytokenpocket",
			},
		},
	},
	{
		title: "Binance",
		name: "Binance Wallet",
		icon: "/wallets/wallet_binance.webp",
		link: {
			desktop: "https://www.binance.com/en/web3wallet",
			mobile: {
				ios: "https://apps.apple.com/app/binance-buy-bitcoin-crypto/id1436799971",
				android:
					"https://play.google.com/store/apps/details?id=com.binance.dev",
			},
		},
	},
	{
		title: "Phantom",
		name: "Phantom",
		icon: "/wallets/ic_phantom.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
			mobile: {
				ios: "https://apps.apple.com/app/phantom-crypto-wallet/id1598432977",
				android: "https://play.google.com/store/apps/details?id=app.phantom",
			},
		},
	},
	{
		title: "Backpack",
		name: "Backpack",
		icon: "/wallets/wallet-backpack.png",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
			mobile: {
				ios: "https://apps.apple.com/app/backpack-buy-trade-crypto/id6445964121",
				android:
					"https://play.google.com/store/apps/details?id=app.backpack.mobile",
			},
		},
	},
	{
		title: "xPortal",
		name: "xPortal",
		icon: "/wallets/wallet_xportal.webp",
		link: {
			mobile: {
				ios: "https://apps.apple.com/app/xportal-btc-crypto-wallet/id1519405832",
				android:
					"https://play.google.com/store/apps/details?id=com.elrond.maiar.wallet",
			},
		},
	},
	{
		title: "Sui Wallet",
		name: "Sui Wallet",
		icon: "/wallets/ic_sui_wallet.webp",
		link: {
			desktop:
				"https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
		},
	},
]
