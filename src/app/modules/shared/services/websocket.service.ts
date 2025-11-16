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
  private hasConnectedBefore = false;
  private lastHeartbeat = Date.now();
  private readonly stateManagerService = inject(StateManagerService);

  public connect(): Observable<void> {
    return new Observable((observer) => {
      this.stateManagerService.setWsConnecting();
      this.createClient(observer);
      this.client.activate();

      return () => {
        this.stateManagerService.setWsDisconnected();
        if (this.client && this.isConnected) {
          this.client.deactivate();
        }
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

  private createClient(observer?: any) {
    const url = `${environment.baseApiUrl}/live`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (mssg) => { console.log(mssg); },
      onConnect: () => {
        this.isConnected = true;
        this.stateManagerService.setWsConnected();

        if (this.reconnectAttempts > 0 && this.hasConnectedBefore) {
          this.stateManagerService.updateWsState('Connection restored');
        }

        this.hasConnectedBefore = true;
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.restoreSubscriptions();
        this.lastHeartbeat = Date.now();

        // Notify observer that connection is established
        if (observer) {
          observer.next();
          observer.complete();
        }
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.stateManagerService.setWsDisconnected();
        // Only show notification if we had a successful connection before and are now reconnecting
        if (this.hasConnectedBefore && this.reconnectAttempts > 0) {
          this.stateManagerService.updateWsState('Disconnected from server');
        }
      },
      onWebSocketClose: () => {
        this.handleServerCrash();
      },
      onStompError: (error) => {
        this.handleServerCrash();
        // Notify observer of error
        if (observer) {
          observer.error(error);
        }
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

    // Only show reconnection message if we're already in a reconnection attempt (not the first disconnect)
    if (this.hasConnectedBefore && this.reconnectAttempts > 0) {
      this.stateManagerService.updateWsState('Trying to reconnect');
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.createClient(); // No observer during reconnection
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
