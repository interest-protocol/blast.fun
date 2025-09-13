import axios from "axios"
import { env } from "@/env"

const API_URL = env.NEXT_PUBLIC_NEXA_BASE_URL

export interface PrivyRawSignResponseType {
  signature: {
    data: {
      signature: string
    }
  }
  publicKey: string
}

export interface PrivyWalletResponse {
  address: string
  publicKey: string
  createdNew?: boolean
}

class PrivyApiService {
  static async createOrGetUserWallet(token: string) {
    return axios.post(`${API_URL}/privy/create-or-get`, {
      token
    })
  }

  static async rawSignTransaction(hash: string, token: string) {
    return axios.post(`${API_URL}/privy/raw-sign-transaction`, {
      hash,
      token
    })
  }
}

export default PrivyApiService