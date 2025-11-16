import { inject } from "@angular/core";
import { WebsocketService, StateManagerService } from "@shared/services";
import { interval } from "rxjs";

export function WebsocketAppInitializer() {
  const ws = inject(WebsocketService);
  const stateManager = inject(StateManagerService);

  // Only connect if user is already authenticated (from previous session)
  if (stateManager.getUser().isLoggedIn) {
    ws.connect().subscribe();
  }

  interval(10_000).subscribe(() => ws.checkHeartbeat());
}
