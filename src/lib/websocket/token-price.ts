import type { Socket } from 'socket.io-client';
import type { TradeData } from '@/types/trade'
import { io } from 'socket.io-client';

const URL = 'https://socket.insidex.trade';

class TokenPriceSocket {
    private socket: Socket;

    constructor() {
        this.socket = io(URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });
    }

    disconnectSocket() {
        this.socket.disconnect();
    }

    public subscribeToTokenPrice(
        pool: string,
        direction: string,
        callback: (data: { price: number; suiPrice: number }) => void
    ) {
        this.socket.emit('subscribe-price', {
            pool,
            direction
        });

        this.socket.on(`price-${pool}-${direction}`, callback);
    }

    public unsubscribeFromTokenPrice(pool: string, direction: string) {
        this.socket.emit('unsubscribe-price', {
            pool,
            direction
        });

        this.socket.off(`price-${pool}-${direction}`);
    }

    public subscribeToCoinTrades(
        coin: string,
        callback: (trade: TradeData) => void
    ) {
        this.socket.emit('subscribe-trades', {
            coin
        });

        this.socket.on(`trades-${coin}`, callback);
    }

    public unsubscribeFromCoinTrades(coin: string) {
        this.socket.emit('unsubscribe-trades', {
            coin
        });

        this.socket.off(`trades-${coin}`);
    }
}

const tokenPriceSocket = new TokenPriceSocket();
export default tokenPriceSocket;
