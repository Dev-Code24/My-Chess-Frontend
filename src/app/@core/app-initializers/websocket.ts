import { inject } from "@angular/core";
import { WebsocketService } from "@shared/services";
import { interval } from "rxjs";

export function WebsocketAppInitializer() {
  const ws = inject(WebsocketService);
  interval(10_000).subscribe(() => ws.checkHeartbeat());
}
