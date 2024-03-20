import { Spot, WebsocketStream } from '@binance/connector-typescript';

const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;

export const client = new Spot(apiKey, apiSecret);

// define callbacks for different events
const callbacks = {
  open: () => console.debug('Connected with Websocket server'),
  close: () => console.debug('Disconnected with Websocket server'),
  message: (data: any) => console.info(data),
};

export const websocketStreamClient = new WebsocketStream({ callbacks });
