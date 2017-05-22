import {
  Component,
  ErrorHandler,
  Inject,
} from '@angular/core';

import {IS_IN_POPUP} from './app';

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
  constructor(@Inject(IS_IN_POPUP) private isInPopup: boolean) {
  }
}
