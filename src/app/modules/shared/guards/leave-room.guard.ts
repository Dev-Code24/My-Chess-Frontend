import { CanDeactivateFn } from '@angular/router';
import { PlayComponent } from '../../play/components/play/play.component';
import { inject } from '@angular/core';
import { PlayConnectBackendService } from '../../play/service/play-connect-backend.service';
import { MyChessMessageService, StateManagerService } from '@shared/services';
import { catchError, map, of, tap, timeout } from 'rxjs';
import { ApiError } from '@shared/@interface';

export const leaveRoomGuard: CanDeactivateFn<PlayComponent> = (component) => {
  const connectPlayBackendService = inject(PlayConnectBackendService);
  const stateManagerService = inject(StateManagerService);
  const messageService = inject(MyChessMessageService);
  const roomId = component.roomId();

  if (!roomId) {
    return true;
  }

  const resetLocalUserState = () => {
    const currentUser = stateManagerService.getUser();
    if (currentUser && currentUser.details) {
      stateManagerService.updateUser({
        ...currentUser,
        details: {
          ...currentUser.details,
          inGame: false,
        }
      });
    }
  };

  return connectPlayBackendService.leaveRoom(roomId).pipe(
    timeout(3000),
    tap(() => {
      resetLocalUserState();
    }),
    map(() => true),
    catchError((error: ApiError) => {
      let errorMessage = 'Failed to leave room.';
      if (error.error.message) {
        errorMessage = error.error.message;
      }
      messageService.showError(errorMessage);
      resetLocalUserState();
      return of(true);
    })
  );
};
