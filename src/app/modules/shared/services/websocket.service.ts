import { inject, Injectable } from '@angular/core';
import {
  Client,
  IMessage,
  messageCallbackType,
} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { WebsocketConnectionStateService } from './websocket-connection-state.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client!: Client;
  private isConnected = false;
  private subscriptions = new Map<string, messageCallbackType>();
  private messageQueue: { destination: string; body: unknown }[] = [];
  private reconnectAttempts = 0;
  private lastHeartbeat = Date.now();
  private stateService = inject(WebsocketConnectionStateService);

  public getWsState(): string {
    return this.stateService.state();
  }

  public connect(): Observable<void> {
    const url = `${environment.baseApiUrl}/live`;

    return new Observable((observer) => {
      this.stateService.setConnecting();

      this.client = new Client({
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: 0,
        heartbeatIncoming: 10_000,
        heartbeatOutgoing: 10_000,
        debug: () => {},
        onConnect: (frame) => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.stateService.setConnected();
          this.flushMessageQueue();
          this.restoreSubscriptions();
          this.lastHeartbeat = Date.now();
          console.log('[WEBSOCKET] CONNECTED');
          observer.next();
          observer.complete();
        },
        onDisconnect: (frame) => {
          console.log('[WEBSOCKET] DISCONNECTED');
          this.isConnected = false;
        },
        onWebSocketClose: () => this.handleDisconnect(),
        onStompError: () => this.handleDisconnect(),
      });

      this.client.activate();

      return () => {
        this.stateService.setDisconnected();
      };
    });
  }

  public subscribe<T>(destination: string): Observable<T> {
    return new Observable<T>((observer) => {
      const callback: messageCallbackType = (msg: IMessage) => {
        let data;
        try {
          data = JSON.parse(msg.body);
        } catch (_) {
          data = msg.body;
        }
        observer.next(data);
      }
      this.subscriptions.set(destination, callback);
      if (this.isConnected) {
        this.client.subscribe(destination, callback);
      }

      return () => {
        this.subscriptions.delete(destination);
      };
    });
  }

  public send(destination: string, body: unknown): void {
    if (!this.isConnected) {
      this.messageQueue.push({ destination, body });
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  public disconnect(): void {
    this.client.deactivate();
    this.isConnected = false;
    this.stateService.setDisconnected();
  }

  public checkHeartbeat() {
    const now = Date.now();
    if (now - this.lastHeartbeat > 20000 && this.isConnected) {
      this.stateService.setStale();
    }
  }

  private handleDisconnect() {
    if (!this.isConnected) {
      return;
    }

    this.isConnected = false;
    this.stateService.setReconnecting();

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);
    this.reconnectAttempts++;

    setTimeout(() => this.client.activate(), delay);
  }

  private restoreSubscriptions() {
    this.subscriptions.forEach((cb, dest) => {
      this.client.subscribe(dest, cb);
    });
  }

  private flushMessageQueue() {
    this.messageQueue.forEach((msg) =>
      this.client.publish({
        destination: msg.destination,
        body: JSON.stringify(msg.body),
      })
    );
    this.messageQueue = [];
  }
}
