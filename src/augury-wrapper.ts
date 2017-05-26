import {
  Component,
  ErrorHandler,
  Inject,
} from '@angular/core';

import {
  Router,
  NavigationStart,
  CanDeactivate,
} from '@angular/router';

import {IS_IN_POPUP} from './app';
import {AuguryIntermediate} from './augury-intermediate';

declare const require: any;
declare const window: any;

require('!style-loader!css-loader!postcss-loader!./styles/app.css');

@Component({
  selector: 'augury-ui',
  template: require('./augury-wrapper.html'),
  styles: [require('to-string-loader!./augury-wrapper.css')],
})
export class AuguryWrapper {
  private isRunning = false;
  constructor(
    @Inject(IS_IN_POPUP) private isInPopup: boolean,
    private router: Router) {
    (<any>window).router = router;
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (this.isRunning && event.url.indexOf('(augury:active)') < 0) {
            this.router.navigateByUrl(event.url + '(augury:active)');
          }
        }
      });
  }

  private ngOnInit() {
    if (this.isInPopup) {
      this.router.navigate([{ outlets: { augury: 'active' }}]);
    }
  }

}
