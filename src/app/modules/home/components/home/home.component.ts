import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { SubSink } from '@shared/@utils/Subsink';
import { COLORS } from '@shared/@utils/constants';
import { faDoorOpen, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { HomeDialog, JoinRoomApiPayload } from '../../@interface';
import { DialogConfig } from '@shared/@interface';
import { JoinRoomComponent } from "../join-room/join-room.component";
import { LinkButtonComponent } from "@shared/components/button/link-button/link-button.component";
import { DialogComponent } from "@shared/components/dialog/dialog.component";
import { HomeConnectBackendService } from 'modules/home/service/home-connect-backend.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ButtonComponent } from "../../../shared/components/button/button/button.component";

@Component({
  selector: 'app-home',
  imports: [LinkButtonComponent, DialogComponent, JoinRoomComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  protected playIcon = faPlayCircle;
  protected joinRoomIcon = faDoorOpen;
  protected BG = COLORS.bg;
  protected joinRoomUrl!: UrlTree;
  protected homeDialog = signal<HomeDialog>({ isVisible: false, formType: null });
  protected homeDialogConfig: DialogConfig = {
    width: '40rem',
    height: '22rem',
    top: '50%',
    left: '50%',
    closable: true,
    backdrop: true,
  };
  protected isLoading = signal<boolean>(false);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly connectBackend = inject(HomeConnectBackendService);
  private readonly subsink = new SubSink();

  public ngOnInit(): void {
    this.joinRoomUrl = this.router.createUrlTree(['home'], { queryParams: { joinRoom: true, }, });
    this.subsink.sink = this.route.queryParams.subscribe((params) => {
      if (params['joinRoom'] === 'true') {
        this.homeDialog.set({ isVisible: true, formType: 'join' });
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
          console.log(response);
          code = response.data.code;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  protected onDialogClose(): void {
    this.router.navigate([], { relativeTo: this.route });
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
          console.log('response', response);
        },
        error: (error: HttpErrorResponse) => {
          console.log('error', error);
        },
        complete: () => {
          this.navigateToRoom(code);
        }
    });
  }

  private navigateToRoom(code: string) {
    this.router.navigate([`play/${code.slice(0, 3)}-${code.slice(3)}`]);
  }
}
