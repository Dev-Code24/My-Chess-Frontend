import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { DialogComponent } from "@shared/components/dialog/dialog.component";

@Component({
  selector: 'mc-loaderDialog',
  imports: [DialogComponent, FontAwesomeModule],
  templateUrl: './loader-dialog.component.html',
})
export class LoaderDialogComponent {
  public readonly message = input<string>('Loading...');
  protected visible: boolean = true;
  protected spinnerIcon = faCircleNotch;
}
