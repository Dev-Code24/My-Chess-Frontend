import { UserInterface } from '@shared/@interface';

export const DEFAULT_USER_DATA : UserInterface = {
  isLoggedIn: false,
  details: null,
};

export const COLORS = {
  bg: {
    bg_WHITE: 'bg-lime-50',
    bg_100: 'bg-lime-100',
    bg_200: 'bg-lime-200',
    bg_300: 'bg-lime-300',
    bg_400: 'bg-lime-400',
    bg_500: 'bg-lime-500',
    bg_600: 'bg-lime-600',
    bg_700: 'bg-lime-700',
    bg_800: 'bg-lime-800',
    bg_900: 'bg-lime-900',
    bg_950: 'bg-lime-950',
  },
};

export enum ERROR_MESSAGES {
  WEBSOCKET_CONNECTION_FAILED = 'Failed to connect to the server.',
  WEBSOCKET_DISCONNECTED_ABRUPTLY = 'Disconnected from the server. Please reload.',
  WEBSOCKET_RECONNECTION_FAILED = 'Reconnection failed.',
  DISCONNECTED_FROM_SERVER = 'Disconnected from the server.',
  FAILED_LEAVING_ROOM = 'Failed to leave room.',
}

export enum MESSAGES {
  WEBSOCKET_CONNECTION_RESTORED = 'Connection restored.',
  WEBSOCKET_RETRYING = 'Trying to reconnect',
  WEBSOCKET_CONNECTED = 'Connected to the server.',
  WAITING_FOR_OPPONENT = 'Waiting for opponent.',
  CONNECTING = 'Connecting.',
}

export const TIMEOUT_IN_MS = 10000;
