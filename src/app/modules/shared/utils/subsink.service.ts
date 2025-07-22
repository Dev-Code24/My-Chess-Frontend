import { Subscription } from 'rxjs';

export class SubSink {
  private subscriptions = new Subscription();

  public add (subscription: Subscription) { this.subscriptions.add(subscription); }

  public set sink (subscription: Subscription) { this.subscriptions.add(subscription); }

  public unsubscribeAll () { this.subscriptions.unsubscribe(); }
}
