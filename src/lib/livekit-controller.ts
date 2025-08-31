import jwt from "jsonwebtoken"
import {
	AccessToken,
	CreateIngressOptions,
	IngressAudioEncodingPreset,
	IngressClient,
	IngressInfo,
	IngressInput,
	IngressVideoEncodingPreset,
	ParticipantInfo,
	ParticipantPermission,
	RoomServiceClient,
} from "livekit-server-sdk"
import { env } from "@/env"

export type RoomMetadata = {
	creator_identity: string
	enable_chat: boolean
	allow_participation: boolean
}

export type ParticipantMetadata = {
	hand_raised: boolean
	invited_to_stage: boolean
	avatar_image: string
}

export type Session = {
	identity: string
	room_name: string
}

export type ConnectionDetails = {
	token: string
	ws_url: string
}

export type CreateIngressParams = {
	room_name?: string
	ingress_type: string
	metadata: RoomMetadata
}

export type CreateIngressResponse = {
	ingress: IngressInfo
	auth_token: string
	connection_details: ConnectionDetails
}

export type CreateStreamParams = {
	room_name?: string
	metadata: RoomMetadata
}

export type CreateStreamResponse = {
	auth_token: string
	connection_details: ConnectionDetails
}

export type JoinStreamParams = {
	room_name: string
	identity: string
}

export type JoinStreamResponse = {
	auth_token: string
	connection_details: ConnectionDetails
}

export class LiveKitController {
	private roomService: RoomServiceClient
	private ingressClient: IngressClient

	constructor() {
		const apiKey = env.LIVEKIT_API_KEY
		const apiSecret = env.LIVEKIT_API_SECRET
		// @dev: Extract host from WebSocket URL for API calls
		const wsUrl = env.NEXT_PUBLIC_LIVEKIT_WS_URL
		const apiUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://')

		this.roomService = new RoomServiceClient(apiUrl, apiKey, apiSecret)
		this.ingressClient = new IngressClient(apiUrl)
	}

	async createStream(params: CreateStreamParams): Promise<CreateStreamResponse> {
		const roomName = params.room_name || this.generateRoomName()
		
		// @dev: Create or get the room
		await this.roomService.createRoom({
			name: roomName,
			metadata: JSON.stringify(params.metadata),
		})

		// @dev: Generate host token
		const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
			identity: params.metadata.creator_identity,
			name: params.metadata.creator_identity,
		})
		
		at.addGrant({
			roomJoin: true,
			room: roomName,
			canPublish: true,
			canSubscribe: true,
			canPublishData: true,
		})

		const token = await at.toJwt()
		const authToken = this.createAuthToken({
			identity: params.metadata.creator_identity,
			room_name: roomName,
		})

		return {
			auth_token: authToken,
			connection_details: {
				token,
				ws_url: env.NEXT_PUBLIC_LIVEKIT_WS_URL,
			},
		}
	}

	async createIngress(params: CreateIngressParams): Promise<CreateIngressResponse> {
		const roomName = params.room_name || this.generateRoomName()
		
		// @dev: Create or get the room
		await this.roomService.createRoom({
			name: roomName,
			metadata: JSON.stringify(params.metadata),
		})

		const options: CreateIngressOptions = {
			name: roomName,
			roomName: roomName,
			participantIdentity: params.metadata.creator_identity,
			participantName: params.metadata.creator_identity,
		}

		let ingressInput: IngressInput
		if (params.ingress_type === "RTMP_INPUT") {
			ingressInput = IngressInput.RTMP_INPUT
		} else {
			ingressInput = IngressInput.WHIP_INPUT
		}

		// @dev: Create ingress with proper type
		const ingress = await this.ingressClient.createIngress(ingressInput, options)

		// @dev: Generate viewer token for the host
		const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
			identity: params.metadata.creator_identity,
			name: params.metadata.creator_identity,
		})
		
		at.addGrant({
			roomJoin: true,
			room: roomName,
			canPublish: false,
			canSubscribe: true,
			canPublishData: true,
		})

		const token = await at.toJwt()
		const authToken = this.createAuthToken({
			identity: params.metadata.creator_identity,
			room_name: roomName,
		})

		return {
			ingress,
			auth_token: authToken,
			connection_details: {
				token,
				ws_url: env.NEXT_PUBLIC_LIVEKIT_WS_URL,
			},
		}
	}

	async joinStream(params: JoinStreamParams): Promise<JoinStreamResponse> {
		// @dev: Generate viewer token
		const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
			identity: params.identity,
			name: params.identity,
		})
		
		at.addGrant({
			roomJoin: true,
			room: params.room_name,
			canPublish: false,
			canSubscribe: true,
			canPublishData: true,
		})

		const token = await at.toJwt()
		const authToken = this.createAuthToken({
			identity: params.identity,
			room_name: params.room_name,
		})

		return {
			auth_token: authToken,
			connection_details: {
				token,
				ws_url: env.NEXT_PUBLIC_LIVEKIT_WS_URL,
			},
		}
	}

	async listRooms() {
		const rooms = await this.roomService.listRooms()
		return rooms.map(room => ({
			name: room.name,
			participantCount: room.numParticipants,
			creatorName: room.metadata ? JSON.parse(room.metadata).creator_identity : "Unknown",
			isLive: room.numParticipants > 0,
		}))
	}

	async inviteToStage(roomName: string, identity: string) {
		const participant = await this.roomService.getParticipant(roomName, identity)
		
		if (!participant) {
			throw new Error("Participant not found")
		}

		// @dev: Update participant permissions
		await this.roomService.updateParticipant(roomName, identity, {
			permission: {
				canPublish: true,
				canSubscribe: true,
				canPublishData: true,
			},
			metadata: JSON.stringify({
				...JSON.parse(participant.metadata || "{}"),
				invited_to_stage: true,
			}),
		})
	}

	async removeFromStage(roomName: string, identity: string) {
		await this.roomService.updateParticipant(roomName, identity, {
			permission: {
				canPublish: false,
				canSubscribe: true,
				canPublishData: true,
			},
			metadata: JSON.stringify({
				hand_raised: false,
				invited_to_stage: false,
			}),
		})
	}

	async updateParticipantMetadata(roomName: string, identity: string, metadata: any) {
		const participant = await this.roomService.getParticipant(roomName, identity)
		const currentMetadata = participant?.metadata ? JSON.parse(participant.metadata) : {}
		
		await this.roomService.updateParticipant(roomName, identity, {
			metadata: JSON.stringify({
				...currentMetadata,
				...metadata,
			}),
		})
	}

	async updateParticipantPermissions(roomName: string, identity: string, permissions: any) {
		await this.roomService.updateParticipant(roomName, identity, {
			permission: permissions,
		})
	}

	private generateRoomName(): string {
		const adjectives = ["swift", "brave", "calm", "eager", "fancy", "gentle", "happy", "jolly", "kind", "lively"]
		const nouns = ["panda", "tiger", "eagle", "shark", "dolphin", "falcon", "leopard", "wolf", "bear", "lion"]
		const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
		const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
		const randomNumber = Math.floor(Math.random() * 9999)
		return `${randomAdjective}-${randomNoun}-${randomNumber}`
	}

	private createAuthToken(session: Session): string {
		return jwt.sign(session, env.LIVEKIT_API_SECRET, {
			expiresIn: "24h",
		})
	}

	verifyAuthToken(token: string): Session {
		const verified = jwt.verify(token, env.LIVEKIT_API_SECRET)
		if (!verified) {
			throw new Error("Invalid token")
		}
		return jwt.decode(token) as Session
	}
}