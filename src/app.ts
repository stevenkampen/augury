import {
  ChangeDetectorRef,
  Component,
  NgZone,
  ErrorHandler,
  OpaqueToken,
  Inject,
} from '@angular/core';

import {UncaughtErrorHandler} from './utils/uncaught-error-handler';
import {reportUncaughtError} from './utils/error-handling';

import {AuguryServer} from './utils/parse-app';

import {
  ApplicationError,
  ApplicationErrorType,
} from './errors/application-error';

import {
  Message,
  MessageFactory,
  MessageResponse,
  MessageType,
  Subscription,
} from './communication';

import {
  ComponentInstanceState,
  ExpandState,
  Options,
  Tab,
  Theme,
  ComponentViewState,
} from './state';

import {
  Change,
  MutableTree,
  Node,
  Path,
  deserializeChangePath,
  serializePath,
} from './tree';

import {createTree} from './tree/mutable-tree-factory';
import {UserActions} from './actions/user-actions/user-actions';
import {Route} from './utils';

export const IS_IN_POPUP = new OpaqueToken('IS_IN_POPUP');

declare const require: any;
declare const window: any;

require('!style-loader!css-loader!postcss-loader!./styles/app.css');

@Component({
  selector: 'augury-content',
  template: require('./app.html'),
  styles: [require('to-string-loader!./app.css')],
})
export class AuguryUIComponent {
  private Tab = Tab;
  private Theme = Theme;

  private componentState: ComponentInstanceState;
  private routerTree: Array<Route>;
  private ngModules: Array<any> = null;
  private selectedNode: Node;
  private selectedTab: Tab = Tab.ComponentTree;
  private subscription: Subscription;
  private tree: MutableTree;
  private error: ApplicationError = null;
  private activateDOMSelection: boolean = false;
  private unsubscribeUncaughtErrorListener;

  private isPoppedOut = false;
  private popup: Window;

  constructor(private parser: AuguryServer,
              private changeDetector: ChangeDetectorRef,
              private options: Options,
              private userActions: UserActions,
              private viewState: ComponentViewState,
              private zone: NgZone,
              private errorHandler: ErrorHandler,
              @Inject(IS_IN_POPUP) private isInPopup: boolean) {

    console.debug('isInPopup:', this.isInPopup);
  }

  private popout = () => {
    if (!this.isInPopup) {
      this.isPoppedOut = true;
      this.popup = window.open(null, 'Augury UI', 'menubar=no,location=no,resizable=yes,scrollbars=no,status=no');
      this.popup._auguryParser = this.parser;
      this.popup.document.write(require('to-string-loader!./index.html'));
    }
  }

  private hasContent() {
    return this.parser.componentData &&
      this.parser.componentData.roots &&
      this.parser.componentData.roots.length > 0;
  }

  private ngDoCheck() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);
    this.changeDetector.detectChanges();
  }

  private ngOnInit() {
    // start Augury parsing
    if (!this.parser.connected) {
      this.parser.connect();
    }
  }

  private ngOnDestroy() {

  }

  private restoreSelection() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);

    this.onSelectNode(this.selectedNode, () => this.componentState.reset());
  }

  private onSelectNode(node: Node, beforeLoad?: () => void) {
    this.selectedNode = node;

    if (node == null) {
      this.viewState.unselect();
      return;
    }

    this.viewState.select(node);

    const m = MessageFactory.selectComponent(node, node.isComponent);

    // const promise = this.directConnection.handleImmediate(m)
    //   .then(response => {
    //     if (typeof beforeLoad === 'function') {
    //       beforeLoad();
    //     }

    //     const {
    //       instance,
    //       metadata,
    //       providers,
    //       componentMetadata,
    //     } = response;

    //     return {
    //       instance,
    //       providers,
    //       metadata: new Map(metadata),
    //       componentMetadata: new Map(componentMetadata),
    //     };
    //   });

    // this.componentState.wait(node, promise);
  }

  private onInspectElement(node: Node) {
    // chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.nodeFromPath('${node.id}'))`);
  }

  private onCollapseChildren(node: Node) {
    this.recursiveExpansionState(node, ExpandState.Collapsed);
  }

  private onExpandChildren(node: Node) {
    this.recursiveExpansionState(node, ExpandState.Expanded);
  }

  private onReportError() {
    if (this.error && this.error.errorType === ApplicationErrorType.UncaughtException) {
      reportUncaughtError(this.error.error);
      this.error = null;
      // this.requestTree();
    }
  }

  private onSelectedTabChange(tab: Tab) {
    this.selectedTab = tab;
    this.routerTree = this.routerTree ? [].concat(this.routerTree) : null;
  }

  private onDOMSelectionChange(state: boolean) {
    this.activateDOMSelection = state;
  }

  private extractIdentifiersFromChanges(changes: Array<Change>): string[] {
    const identifiers = new Set<string>();

    for (const change of changes) {
      const path = this.nodePathFromChangePath(deserializeChangePath(change.path));

      identifiers.add(serializePath(path));
    }

    const results = new Array<string>();

    identifiers.forEach(id => results.push(id));

    return results;
  }

  private nodePathFromChangePath(changePath: Path) {
    const result = new Array<string | number>();

    for (let index = 0; index < changePath.length; ++index) {
      switch (changePath[index]) {
        case 'roots':
        case 'children':
          result.push(changePath[++index]);
          break;
      }
    }

    return result;
  }

  private recursiveExpansionState(from: Node, state: ExpandState) {
    const apply = (node: Node) => {
      this.viewState.expandState(node, state);

      node.children.forEach(n => apply(n));
    };

    apply(from);
  }
}
