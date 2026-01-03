import { inject, Injectable } from '@angular/core';
import { CommonConnectBackendService } from '@shared/services';
import { Observable } from 'rxjs';
import { EasterEggResponse } from '../@interface';

@Injectable({
  providedIn: 'root'
})
export class EasterEggService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  public getHelloWorld(): Observable<EasterEggResponse> {
    return this.commonConnectBackend.get<EasterEggResponse>('/hello-world');
  }
}
