import { Unsubscribe } from 'redux';
import { throttle } from 'lodash';
import { r } from '../lib/redux';
import { GamepadState, GamepadStore, GamepadAction } from './store';

const URL = 'ws://192.168.1.68:8080/ws';

// State

export type ConnectionState = 'NONE' | 'CONNECTING' | 'OPEN' | 'CLOSED' | 'RECONNECTING';

export interface WebSocketState {
  state: ConnectionState;
}

export const initialWebSocketState: WebSocketState = {
  state: 'NONE',
};

// Actions

export type WebSocketConnecting = {
  type: 'WEBSOCKET_CONNECTING';
};
export const webSocketConnecting = (): WebSocketConnecting => ({ type: 'WEBSOCKET_CONNECTING', });

export type WebSocketConnected = {
  type: 'WEBSOCKET_CONNECTED';
};
export const webSocketConnected = (): WebSocketConnected => ({ type: 'WEBSOCKET_CONNECTED', });

export type WebSocketClosed = {
  type: 'WEBSOCKET_CLOSED';
};
export const webSocketClosed = (): WebSocketClosed => ({ type: 'WEBSOCKET_CLOSED', });

export type WebSocketAction =
  WebSocketConnecting |
  WebSocketConnected |
  WebSocketClosed;

// Reducer

export const webSocketReducer = r((state: WebSocketState, action: GamepadAction): WebSocketState => {
  switch (action.type) {
    case 'WEBSOCKET_CONNECTING':
      if (state.state !== 'NONE') {
        return {
          state: 'RECONNECTING',
        };
      } else {
        return {
          state: 'CONNECTING',
        }
      }
    case 'WEBSOCKET_CONNECTED':
      return {
        state: 'OPEN',
      }
    case 'WEBSOCKET_CLOSED':
      return {
        state: 'CLOSED',
      }
    default:
      return state;
  }
});

// Impl
export type WebSocketPacket = {
  left: {
    x: number;
    y: number;
  },
  right: {
    x: number;
    y: number;
  };
};

export const getPacket = (state: GamepadState): WebSocketPacket => ({
  left: {
    x: Math.floor(state.joysticks.left.x),
    y: Math.floor(state.joysticks.left.y),
  },
  right: {
    x: Math.floor(state.joysticks.right.x),
    y: Math.floor(state.joysticks.right.y),
  },
});

export const getBinaryPacket = (state: GamepadState): Uint8Array =>
  Uint8Array.from([
    state.joysticks.left.x, // Yaw
    state.joysticks.left.y, // Throttle
    state.joysticks.right.x, // Roll
    state.joysticks.right.y, // Pitch
  ]);

export const storeToWebSocket = (store: GamepadStore) => {
  const ws = new WebSocket(URL);
  store.dispatch(webSocketConnecting());
  let subscription: Unsubscribe;

  ws.addEventListener('open', () => {
    store.dispatch(webSocketConnected());

    subscription = store.subscribe(
      // Throttle messages with max 1 every 100ms
      throttle(() => {
        ws.send(getBinaryPacket(store.getState()).buffer);
      }, 100)
    );
  });

  ws.addEventListener('close', () => {
    store.dispatch(webSocketClosed());

    // wait a few seconds then try to reconnect
    setTimeout(() => {
      storeToWebSocket(store);
    }, 5000);
  });

  ws.addEventListener('error', (error) => {
    console.error(error);
  });

  ws.addEventListener('message', (message) => {
    console.log(message);
  });
}
