import { inject, Injectable } from '@angular/core';
import { Client, IMessage, messageCallbackType } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { StateManagerService } from '@shared/services';

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
  private readonly stateManagerService = inject(StateManagerService);

  public connect(): Observable<void> {
    return new Observable(() => {
      this.stateManagerService.setWsConnecting();
      this.createClient();
      this.client.activate();

      return () => {
        this.stateManagerService.setWsDisconnected();
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
      this.client.deactivate();
    }
    this.isConnected = false;
    this.stateManagerService.setWsDisconnected();
  }

  public checkHeartbeat() {
    const now = Date.now();
    if (now - this.lastHeartbeat > 20000 && this.isConnected) {
      this.stateManagerService.setWsStale();
    }
  }

  private createClient() {
    const url = `${environment.baseApiUrl}/live`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        this.isConnected = true;
        this.stateManagerService.setWsConnected();

        if (this.reconnectAttempts > 0) {
          this.stateManagerService.updateWsState('Connection restored');
        }

        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.restoreSubscriptions();
        this.lastHeartbeat = Date.now();
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.stateManagerService.setWsDisconnected();
        this.stateManagerService.updateWsState('Disconnected from server');
      },
      onWebSocketClose: () => {
        this.handleServerCrash();
      },
      onStompError: () => {
        this.handleServerCrash();
      }
    });
  }

  private handleServerCrash() {
    if (this.reconnectAttempts > 15) {
      this.stateManagerService.setWsDisconnected();
      this.stateManagerService.updateWsState('Reconnection failed');
      return;
    }

    this.isConnected = false;
    this.stateManagerService.setWsDisconnected();
    this.stateManagerService.updateWsState('Trying to reconnect');

    const delay = 2000;

    setTimeout(() => {
      this.reconnectAttempts++;
      this.createClient();
      this.client.activate();
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
