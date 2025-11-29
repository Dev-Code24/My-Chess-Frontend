import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';

import { SubSink } from '@shared/@utils/Subsink';
import { COLORS } from '@shared/@utils/constants';
import { faDoorOpen, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { JoinRoomApiPayload } from '../../@interface';
import {ApiError, UserDetails, UserInterface} from '@shared/@interface';
import { JoinRoomComponent } from "../join-room/join-room.component";
import { LinkButtonComponent } from "@shared/components/button/link-button/link-button.component";
import { HomeConnectBackendService } from '../../service/home-connect-backend.service';
import { finalize } from 'rxjs';
import { ButtonComponent } from "@shared/components/button/button";
import { MyChessMessageService, StateManagerService } from '@shared/services';
import { LoginApiResponse } from '../../../auth/@interface';

@Component({
  selector: 'app-home',
  imports: [LinkButtonComponent, JoinRoomComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  protected playIcon = faPlayCircle;
  protected joinRoomIcon = faDoorOpen;
  protected joinRoomUrl!: UrlTree;
  protected isJoinFormDialogVisible = signal<boolean>(false);
  protected isLoading = signal<boolean>(false);

  private readonly subsink = new SubSink();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MyChessMessageService);
  private readonly connectBackend = inject(HomeConnectBackendService);
  private readonly stateManagerService = inject(StateManagerService);

  public ngOnInit(): void {
    this.getUserDetails();
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

  private getUserDetails(): void {
    this.subsink.sink = this.connectBackend.getUserDetails().subscribe({
      next: (response: LoginApiResponse) => {
        const user = this.stateManagerService.getUser();
        user.details = response.data as UserDetails;
        this.stateManagerService.updateUser(user);
      }
    });
  }
}
