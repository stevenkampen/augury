import 'reflect-metadata';

import {HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {NgModule, ErrorHandler, enableProdMode, Component} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

declare const window: any;

import {AuguryWrapper} from './augury-wrapper';
import {AuguryModule} from './module';

import {IS_IN_POPUP} from './app';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'main',
        loadChildren: () => AuguryModule,
      }
    ])
  ],
  declarations: [
    AuguryWrapper,
  ],
  providers: [
    Location, {provide: LocationStrategy, useClass: HashLocationStrategy},
    // { provide: ErrorHandler, useClass: UncaughtErrorHandler },
    {
      provide: IS_IN_POPUP,
      useValue: !!window._auguryParser,
    },
  ],
  bootstrap: [AuguryWrapper]
})
export class AuguryWrapperModule {}
