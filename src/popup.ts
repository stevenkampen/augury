import {AuguryWrapperModule} from './wrapper-module';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

let loaded = false;

(<any>window)._loadAugury = () => {
  console.debug('_loadAugury called...');
  if (!loaded) {
    loaded = true;
    console.debug('Bootstrapping Augury in popup...');
    platformBrowserDynamic().bootstrapModule(AuguryWrapperModule);
  }
};
