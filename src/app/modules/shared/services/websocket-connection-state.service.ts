import { Injectable, signal } from '@angular/core';
import { WebSocketState } from '@shared/@interface';

@Injectable({
  providedIn: 'root'
})
export class WebsocketConnectionStateService {
  public state = signal<WebSocketState>(WebSocketState.DISCONNECTED);

  public setConnecting() { this.state.set(WebSocketState.CONNECTING); }
  public setConnected() { this.state.set(WebSocketState.CONNECTED); }
  public setDisconnected() { this.state.set(WebSocketState.DISCONNECTED); }
  public setReconnecting() { this.state.set(WebSocketState.RECONNECTING); }
  public setStale() { this.state.set(WebSocketState.STALE); }
}
