import { bcs } from "@mysten/sui/bcs"
import { fromHex, normalizeSuiAddress, toHex } from "@mysten/sui/utils"
import BigNumber from "bignumber.js"

import { TokenFormValues } from "@/app/(root)/launch/_components/create-token-form"
import { DEFAULT_TOKEN_DECIMALS } from "@/constants"
import * as template from "./move-bytecode-template"

const Address = bcs.bytes(32).transform({
	// To change the input type, you need to provide a type definition for the input
	input: (val: string) => fromHex(val),
	output: (val) => toHex(val),
})

const updateDecimals = (modifiedByteCode: Uint8Array, decimals = 9) =>
	template.update_constants(
		modifiedByteCode,
		bcs.u8().serialize(decimals).toBytes(),
		bcs.u8().serialize(9).toBytes(),
		"U8"
	)

const updateSymbol = (modifiedByteCode: Uint8Array, symbol: string) =>
	template.update_constants(
		modifiedByteCode,
		bcs.string().serialize(symbol.trim()).toBytes(),
		bcs.string().serialize("SYMBOL").toBytes(),
		"Vector(U8)"
	)

const updateName = (modifiedByteCode: Uint8Array, name: string) => {
	return template.update_constants(
		modifiedByteCode,
		bcs.string().serialize(name.trim()).toBytes(),
		bcs.string().serialize("NAME").toBytes(),
		"Vector(U8)"
	)
}

const updateDescription = (modifiedByteCode: Uint8Array, description: string) =>
	template.update_constants(
		modifiedByteCode,
		bcs.string().serialize(description.trim()).toBytes(),
		bcs.string().serialize("DESCRIPTION").toBytes(),
		"Vector(U8)"
	)

const updateUrl = (modifiedByteCode: Uint8Array, url: string) =>
	template.update_constants(
		modifiedByteCode,
		bcs.string().serialize(url).toBytes(),
		bcs.string().serialize("url").toBytes(),
		"Vector(U8)"
	)

const updateMintAmount = (modifiedByteCode: Uint8Array, supply: BigNumber) =>
	template.update_constants(
		modifiedByteCode,
		bcs.u64().serialize(supply.toString()).toBytes(),
		bcs.u64().serialize(0).toBytes(),
		"U64"
	)

const updateTreasuryCapRecipient = (modifiedByteCode: Uint8Array, recipient: string) =>
	template.update_constants(
		modifiedByteCode,
		Address.serialize(recipient).toBytes(),
		Address.serialize(normalizeSuiAddress("0x0")).toBytes(),
		"Address"
	)

export const getBytecode = async (info: TokenFormValues, recipient: string) => {
	const isSameNameAndSymbol = info.symbol === info.name
	const bytecode = await fetch(`/api/bytecode?type=coin${isSameNameAndSymbol ? "-same" : ""}`).then((res) => res.text())

	const templateByteCode = fromHex(bytecode)

	const modifiedByteCode = template.update_identifiers(templateByteCode, {
		COIN_TEMPLATE: info.symbol.trim().toUpperCase().replaceAll(" ", "_"),
		coin_template: info.symbol.trim().toLowerCase().replaceAll(" ", "_"),
	})

	let updated = updateDecimals(modifiedByteCode, DEFAULT_TOKEN_DECIMALS)
	if (isSameNameAndSymbol) {
		updated = updateSymbol(updated, info.symbol)
	} else {
		updated = updateSymbol(updated, info.symbol)
		updated = updateName(updated, info.name)
	}

	updated = updateSymbol(updated, info.symbol)
	updated = updateName(updated, info.name)

	updated = updateDescription(updated, info.description ?? "")
	updated = updateUrl(updated, info.imageUrl ?? "")

	const supply = BigNumber(0)

	updated = updateMintAmount(updated, supply)
	updated = updateTreasuryCapRecipient(updated, recipient)

	return updated
}
