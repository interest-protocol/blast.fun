import {
  messageWithIntent,
  toSerializedSignature
} from "@mysten/sui/cryptography"
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519"
import type { Transaction } from "@mysten/sui/transactions"
import { fromHex, toHex } from "@mysten/sui/utils"
import { blake2b } from "@noble/hashes/blake2b"
import toast from "react-hot-toast"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { env } from "@/env"

import PrivyApiService from "@/services/privy-api.service"
import type { PrivyRawSignResponseType } from "@/services/privy-api.service"

// @dev: Create Sui client
const client = new SuiClient({
  url: getFullnodeUrl(env.NEXT_PUBLIC_DEFAULT_NETWORK),
})

export const verifyAndSignPrivyTransaction = async (
  tx: Transaction,
  accessToken: string | null
): Promise<{ signature: string } | null> => {
  try {
    if (!accessToken) {
      throw new Error("No access token provided")
    }

    const txBytes = await tx.build({ client })
    const intentMessage = messageWithIntent("TransactionData", txBytes)
    const digest = blake2b(intentMessage, { dkLen: 32 })
    const hashToSign = `0x${toHex(digest)}`

    const signatureResponse = await PrivyApiService.rawSignTransaction(
      hashToSign,
      accessToken
    )

    const signatureData = signatureResponse.data as PrivyRawSignResponseType
    const { signature } = signatureData.signature.data
    const { publicKey } = signatureData

    const pubKey = new Ed25519PublicKey(
      // @dev: public key from the Privy wallet. "001f89f..."
      // need to remove "00" from the start
      fromHex(publicKey.slice(2))
    )

    const txSignature = toSerializedSignature({
      signature: fromHex(signature),
      signatureScheme: "ED25519",
      publicKey: pubKey
    })

    return { signature: txSignature }
  } catch (err) {
    console.error(err)
    toast.error("Transaction failed")
    return null
  }
}

export const verifyAndExecutePrivyTransaction = async (
  tx: Transaction,
  accessToken: string | null
): Promise<any> => {
  try {
    if (!accessToken) {
      throw new Error("No access token provided")
    }

    const txBytes = await tx.build({ client })
    const intentMessage = messageWithIntent("TransactionData", txBytes)
    const digest = blake2b(intentMessage, { dkLen: 32 })
    const hashToSign = `0x${toHex(digest)}`

    const signatureResponse = await PrivyApiService.rawSignTransaction(
      hashToSign,
      accessToken
    )

    const signatureData = signatureResponse.data as PrivyRawSignResponseType
    const { signature } = signatureData.signature.data
    const { publicKey } = signatureData

    const pubKey = new Ed25519PublicKey(
      // @dev: public key from the Privy wallet. "001f89f..."
      // need to remove "00" from the start
      fromHex(publicKey.slice(2))
    )

    const txSignature = toSerializedSignature({
      signature: fromHex(signature),
      signatureScheme: "ED25519",
      publicKey: pubKey
    })

    const result = await client.executeTransactionBlock({
      transactionBlock: txBytes,
      signature: txSignature,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    })

    return result
  } catch (err) {
    console.error(err)
    toast.error("Transaction failed")
    return null
  }
}

export const verifyAndSignPersonalMessageWithPrivy = async (
  message: string,
  accessToken: string | null
): Promise<{ signature: string; bytes: string }> => {
  try {
    if (!accessToken) {
      throw new Error("No access token provided")
    }

    const messageBytes = new TextEncoder().encode(message)

    // @dev: Correct: wrap with PersonalMessage intent
    const intentMessage = messageWithIntent("PersonalMessage", messageBytes)

    // @dev: Hash the intent message (blake2b-256)
    const digest = blake2b(intentMessage, { dkLen: 32 })

    // @dev: Convert to 0x-prefixed hex string (Privy expects this format)
    const hashToSign = `0x${toHex(digest)}`

    // @dev: Ask Privy to sign the digest
    const signatureResponse = await PrivyApiService.rawSignTransaction(
      hashToSign,
      accessToken
    )

    const signatureData = signatureResponse.data as PrivyRawSignResponseType
    const { signature } = signatureData.signature.data
    const { publicKey } = signatureData

    const pubKey = new Ed25519PublicKey(
      // @dev: remove the 0x00 prefix from Privy key
      fromHex(publicKey.slice(2))
    )

    const messageSignature = toSerializedSignature({
      signature: fromHex(signature),
      signatureScheme: "ED25519",
      publicKey: pubKey
    })

    return { signature: messageSignature, bytes: toHex(messageBytes) }
  } catch (err) {
    console.error(err)
    toast.error("Message signing failed")
    return { signature: "", bytes: "" }
  }
}