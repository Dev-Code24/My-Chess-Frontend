import { inject, Injectable } from '@angular/core';
import { Client, IMessage, messageCallbackType } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../../environments/environment';
import { Observable, Subscriber } from 'rxjs';
import { StateManagerService } from '@shared/services';
import { ERROR_MESSAGES, MESSAGES } from '@shared/@utils';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client!: Client;
  private isConnected = false;
  private reconnectAttempts = 0;
  private lastHeartbeat = Date.now();
  private hasConnectedBefore = false;
  private messageQueue: { destination: string; body: unknown }[] = [];
  private subscriptions = new Map<string, messageCallbackType>();
  private readonly stateManagerService = inject(StateManagerService);

  public connect(): Observable<void> {
    return new Observable((observer) => {
      this.stateManagerService.setWsConnecting();
      this.createClient(observer);
      this.client.activate();

      return () => {
        if (this.isConnected && this.client) {
          this.client.deactivate();
        }
      }
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
      };

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
    if (this.client && this.isConnected) {
      this.isConnected = false;
      this.stateManagerService.setWsDisconnected();
      this.client.deactivate();
    }
  }

  public checkHeartbeat() {
    const now = Date.now();
    if (now - this.lastHeartbeat > 20000 && this.isConnected) {
      this.stateManagerService.setWsStale();
    }
  }

  private createClient(observer?: Subscriber<void>) {
    const url = `${environment.baseApiUrl}/live`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => { },
      onConnect: () => {
        this.isConnected = true;
        this.stateManagerService.setWsConnected();
        if (this.reconnectAttempts > 0 && this.hasConnectedBefore) {
          this.stateManagerService.updateWsStateNotification(MESSAGES.WEBSOCKET_CONNECTION_RESTORED);
        }

        this.hasConnectedBefore = true;
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.restoreSubscriptions();
        this.lastHeartbeat = Date.now();

        if (observer) {
          observer.next();
        }
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.stateManagerService.setWsDisconnected();
        if (this.hasConnectedBefore && this.reconnectAttempts > 0) {
          this.stateManagerService.updateWsStateNotification(ERROR_MESSAGES.DISCONNECTED_FROM_SERVER);
        }
      },
      onWebSocketClose: () => {
        this.stateManagerService.setWsDisconnected();
        this.handleServerCrash();
      },
      onStompError: (error) => {
        this.stateManagerService.setWsDisconnected();
        this.handleServerCrash();
        if (observer) {
          observer.error(error);
        }
      }
    });
  }

  private handleServerCrash() {
    this.isConnected = false;

    if (this.reconnectAttempts > 20) {
      this.stateManagerService.setWsDisconnected();
      this.stateManagerService.updateWsStateNotification(ERROR_MESSAGES.WEBSOCKET_RECONNECTION_FAILED);
      return;
    }

    if (this.hasConnectedBefore && this.reconnectAttempts > 0) {
      this.stateManagerService.setWsReconnecting();
      this.stateManagerService.updateWsStateNotification(MESSAGES.WEBSOCKET_RETRYING);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);

    const timeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      this.createClient();
      this.client.activate();
      if (this.client.connected) {
        clearTimeout(timeoutId);
      }
    }, delay);
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
