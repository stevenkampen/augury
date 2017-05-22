import 'reflect-metadata';

import {NgModule, ErrorHandler, enableProdMode, Component} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {Accordion} from './components/accordion/accordion';
import {AppTrees} from './components/app-trees/app-trees';
import {ComponentInfo} from './components/component-info/component-info';
import {ComponentTree} from './components/component-tree/component-tree';
import {DependencyInfo} from './components/dependency-info/dependency-info';
import {InjectorTree} from './components/injector-tree/injector-tree';
import {NodeAttributes} from './components/node-item/node-attributes';
import {NodeItem} from './components/node-item/node-item';
import {NodeOpenTag} from './components/node-item/node-open-tag';
import {PropertyEditor} from './components/property-editor/property-editor';
import {PropertyValue} from './components/property-value/property-value';
import {RenderState} from './components/render-state/render-state';
import {RouterInfo} from './components/router-info/router-info';
import {RouterTree} from './components/router-tree/router-tree';
import {Search} from './components/search/search';
import {SplitPane} from './components/split-pane/split-pane';
import {StateValues} from './components/state-values/state-values';
import {TabMenu} from './components/tab-menu/tab-menu';
import {TreeView} from './components/tree-view/tree-view';
import {RenderError} from './components/render-error/render-error';
import {ReportError} from './components/report-error/report-error';
import {InfoPanel} from './components/info-panel/info-panel';
import {UserActions} from './actions/user-actions/user-actions';
import {NgModuleInfo} from './components/ng-module-info/ng-module-info';
import {NgModuleConfigView} from './components/ng-module-config-view/ng-module-config-view';

import {UncaughtErrorHandler} from './utils/uncaught-error-handler';

import {AuguryServer} from './utils/parse-app';

import {
  ComponentViewState,
  ComponentPropertyState,
  Options,
} from './state';

declare const window: any;

import {AuguryUIComponent} from './app';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AuguryUIComponent,
      },
    ])
  ],
  declarations: [
    AuguryUIComponent,
    Accordion,
    AppTrees,
    ComponentInfo,
    ComponentTree,
    DependencyInfo,
    InfoPanel,
    InjectorTree,
    NodeAttributes,
    NodeItem,
    NodeOpenTag,
    PropertyEditor,
    PropertyValue,
    RenderError,
    ReportError,
    RouterInfo,
    RenderState,
    RouterTree,
    Search,
    SplitPane,
    StateValues,
    TabMenu,
    TreeView,
    NgModuleInfo,
    NgModuleConfigView,
  ],
  providers: [
    Options,
    UserActions,
    ComponentViewState,
    ComponentPropertyState,
    {
      provide: AuguryServer,
      useValue: window._auguryParser
        ? window._auguryParser : new AuguryServer()
    },

    // { provide: ErrorHandler, useClass: UncaughtErrorHandler },
  ],
  bootstrap: []
})
export class AuguryModule {}
