import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';

import { SubSink } from '@shared/@utils/Subsink';
import { COLORS } from '@shared/@utils/constants';
import { faDoorOpen, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { JoinRoomApiPayload } from '../../@interface';
import { ApiError } from '@shared/@interface';
import { JoinRoomComponent } from "../join-room/join-room.component";
import { LinkButtonComponent } from "@shared/components/button/link-button/link-button.component";
import { HomeConnectBackendService } from 'modules/home/service/home-connect-backend.service';
import { finalize } from 'rxjs';
import { ButtonComponent } from "../../../shared/components/button/button/button.component";
import { MyChessMessageService } from '@shared/services';

@Component({
  selector: 'app-home',
  imports: [LinkButtonComponent, JoinRoomComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  protected playIcon = faPlayCircle;
  protected joinRoomIcon = faDoorOpen;
  protected BG = COLORS.bg;
  protected joinRoomUrl!: UrlTree;
  protected isJoinFormDialogVisible = signal<boolean>(false);
  protected isLoading = signal<boolean>(false);

  private readonly subsink = new SubSink();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MyChessMessageService);
  private readonly connectBackend = inject(HomeConnectBackendService);

  public ngOnInit(): void {
    this.joinRoomUrl = this.router.createUrlTree(['home'], { queryParams: { joinRoom: true, }, });
    this.subsink.sink = this.route.queryParams.subscribe((params) => {
      if (params['joinRoom'] === 'true') {
        this.isJoinFormDialogVisible.set(true);
      }
    });
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }
  // TODO: Figure out what to do with create and join room responses or make the API responses send nothing
  protected createRoom(): void {
    this.isLoading.set(true);
    let code: string;
    this.subsink.sink = this.connectBackend.createRoom()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          if (code) { this.navigateToRoom(code); }
        })
      )
      .subscribe({
      next: (response) => {
          code = response.data.code;
          this.messageService.showSuccess(`Joining the room with room code: ${code}`);
      },
      error: (error: ApiError) => this.messageService.showError(error.error.message),
    });
  }

  protected onRoomJoin(code: string): void {
    const joinRoomApiPayload: JoinRoomApiPayload = { code };
    this.isLoading.set(true);
    this.subsink.sink = this.connectBackend.joinRoom(joinRoomApiPayload)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.messageService.showSuccess(`Joining the room with room code: ${response.data.code}`);
        },
        error: (error: ApiError) => this.messageService.showError(error.error.message),
        complete: () => {
          this.navigateToRoom(code);
        }
    });
  }

  private navigateToRoom(code: string) {
    this.router.navigate([`play/${code}`]);
  }
}
