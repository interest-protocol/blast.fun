# Livestreaming Feature Setup

This guide explains how to set up and use the livestreaming feature in the BLAST.FUN application.

## Quick Start (Streaming Only)

If you only want to work on the streaming UI without other features:

1. Copy the minimal environment file:
```bash
cp .env.streaming .env
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Navigate to `/stream` to access the streaming features.

## Environment Variables

### Required for Streaming

The following environment variables are **required** for the streaming feature:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_WS_URL=your_livekit_websocket_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

### Getting LiveKit Credentials

1. Sign up for a free account at [LiveKit Cloud](https://cloud.livekit.io)
2. Create a new project
3. Copy your WebSocket URL, API Key, and API Secret
4. Add them to your `.env` file

### Full Application Setup

For the complete application with all features, copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials for:
- Database (PostgreSQL)
- Redis
- Twitter OAuth
- Sui Network
- Various API keys

## Streaming Features

### Available Pages

- `/stream` - Stream listing page with room creation
- `/stream/room/[roomId]` - Join and watch a stream
- `/stream/host` - Start a new stream as host
- `/stream/ingress` - Setup RTMP/WHIP streaming from OBS

### Key Components

- **Room List** - Browse active streams
- **Stream Player** - Watch streams with video/audio
- **Chat** - Real-time chat with emoji reactions
- **Participant Management** - Raise hand, invite to stage
- **Reactions** - Send emoji reactions with confetti effects

### Mobile Support

The streaming UI is fully responsive:
- Desktop: Side-by-side video and chat layout
- Mobile: Fullscreen video with floating chat button
- Adapts at 1024px breakpoint

## Development Tips

### Testing Locally

1. Create a stream as host in one browser/tab
2. Join as viewer in another browser/incognito tab
3. Test chat, reactions, and participant features

### Using OBS

1. Go to `/stream/ingress`
2. Select RTMP and create stream
3. Copy the Server URL and Stream Key
4. In OBS:
   - Settings → Stream
   - Service: Custom
   - Server: [paste Server URL]
   - Stream Key: [paste Stream Key]
5. Start streaming in OBS

### Debugging

- Check browser console for WebSocket connection issues
- Ensure LiveKit credentials are correct
- Verify NEXT_PUBLIC_SITE_URL matches your development URL

## Architecture

The streaming feature uses:
- **LiveKit** - WebRTC infrastructure for real-time video/audio
- **LiveKit React Components** - Pre-built UI components
- **Next.js API Routes** - Backend endpoints for room management
- **JWT Authentication** - Secure token generation for participants

## API Endpoints

- `POST /api/stream/create` - Create new stream room
- `POST /api/stream/join` - Join as viewer
- `POST /api/stream/ingress` - Setup RTMP/WHIP ingress
- `POST /api/stream/raise-hand` - Request to join stage
- `POST /api/stream/invite-to-stage` - Host invites viewer
- `POST /api/stream/remove-from-stage` - Remove from stage

## Troubleshooting

### Stream not connecting?
- Check LiveKit credentials in `.env`
- Ensure WebSocket URL starts with `wss://`
- Verify API key and secret match

### Chat not working?
- Ensure data channel is enabled in LiveKit room
- Check browser console for errors

### Mobile layout issues?
- Clear browser cache
- Ensure viewport meta tag is present
- Test in actual mobile browser (not just dev tools)

## Support

For issues specific to the streaming feature, check:
- LiveKit documentation: https://docs.livekit.io
- LiveKit React docs: https://docs.livekit.io/realtime/client-sdks/react/

For general application issues, refer to the main README.