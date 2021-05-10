import { Store, createStore, combineReducers } from 'redux';
import { r } from '../lib/redux';
import {
  initialWebSocketState,
  WebSocketState,
  WebSocketAction,
  webSocketReducer,
} from './websocket';

// State
export interface ViewportState {
  width: number;
  height: number;
}

export type JoystickID = 'left' | 'right';
export interface JoystickState {
  /**
   * Left: 0
   * Center: 127
   * Right: 255
   */
  x: number;
  /**
   * Top: 0
   * Center: 127
   * Bottom: 255
   */
  y: number;
}
export type GamepadJoysticksState = {
  [ID in JoystickID]: JoystickState;
};

export interface GamepadState {
  viewport: ViewportState;
  joysticks: GamepadJoysticksState;
  webSocket: WebSocketState;
};

export const initialState = (): GamepadState => ({
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  joysticks: {
    left: {
      x: 127,
      y: 127,
    },
    right: {
      x: 127,
      y: 127,
    },
  },
  webSocket: initialWebSocketState,
});

// Actions

export type GamepadAction =
  ViewportResize |
  JoystickMove |
  WebSocketAction;

export type ViewportResize = {
  type: 'VIEWPORT_RESIZE';
  width: number;
  height: number;
};
export const viewportResize = (width: number, height: number): ViewportResize => ({
  type: 'VIEWPORT_RESIZE',
  width,
  height,
});

export type JoystickMove = {
  type: 'JOYSTICK_MOVE';
  id: JoystickID;
  x: number;
  y: number;
};
export const joystickMove = (id: JoystickID) => (loc: { x: number, y: number }): JoystickMove => ({
  type: 'JOYSTICK_MOVE',
  id,
  ...loc,
});

export type GamepadStore = Store<GamepadState, GamepadAction>;

// Reducers

/**
 * Helper for defining reducers that already declares the Action type.
 */
export const reducer = <S>(reducerFn: (state: S, action: GamepadAction) => S) => r(reducerFn);

const viewportReducer = reducer((state: ViewportState, action) => {
  switch (action.type) {
    case 'VIEWPORT_RESIZE':
      return {
        width: action.width,
        height: action.height,
      };
    default:
      return state;
  }
});

const joysticksReducer = reducer((state: GamepadJoysticksState, action) => {
  switch (action.type) {
    case 'JOYSTICK_MOVE':
      return {
        ...state,
        [action.id]: {
          x: action.x,
          y: action.y,
        },
      };
    default:
      return state;
  }
})

const gamepadStoreReducer = combineReducers<GamepadState>({
  viewport: viewportReducer,
  joysticks: joysticksReducer,
  webSocket: webSocketReducer,
});

export const createGamepadStore: () => GamepadStore = () => createStore(
  gamepadStoreReducer,
  initialState(),
);
