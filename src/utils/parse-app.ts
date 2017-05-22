import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import {compare} from '../utils/patch';

import {Router} from '@angular/router';

import {
  MutableTree,
  Node,
  Path,
  instanceWithMetadata,
  serializePath,
} from '../tree';

import {onElementFound, onFindElement} from './find-element';

import {
  parseModulesFromRootElement,
  parseModulesFromRouter,
  NgModulesRegistry,
} from './parse-modules';

import {createTreeFromElements} from '../tree/mutable-tree-factory';

import {
  ApplicationError,
  ApplicationErrorType,
} from '../errors/application-error';

import {
  Message,
  MessageFactory,
  MessageType,
} from '../communication';

import {
  parameterTypes,
} from '../tree/decorators';

import {
  Route,
  highlight,
  clear as clearHighlights,
  parseRoutes,
  getNodeFromPartialPath,
  getNodeInstanceParent,
  getNodeProvider,
} from '../utils';

import {serialize} from '../utils';
// import {MessageQueue} from '../structures';
import {SimpleOptions, defaultOptions} from '../options';

declare const window: any;
declare const ng;
declare const getAllAngularRootElements: () => Element[];

const treeRenderOptions: SimpleOptions = defaultOptions();

const AUGURY_ROOT_COMPONENT_NAME = 'AuguryWrapper';

/// For tree deltas that contain more changes than {@link deltaThreshold},
/// we simply send the entire tree again instead of trying to patch it
/// since it will be faster than trying to apply hundreds or thousands of
/// changes to an existing tree.
const deltaThreshold = 512;

export class AuguryServer {
  connected: boolean = false;
  componentData: MutableTree;
  routesData: Array<Route>;
  errors: Subject<Error> = new Subject();
  ngModulesData: NgModulesRegistry = {
    modules: {},
    names: [],
    configs: {},
    tokenIdMap: {},
  };

  private runSafely = (fn: () => any) => {
    try {
      return fn();
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError = (e: Error) => this.errors.next(e);

  private getRoots = () => {
    return getAllAngularRootElements()
      .map(r => ng.probe(r))
      .filter(debugElement =>
        debugElement.componentInstance.constructor.name !== AUGURY_ROOT_COMPONENT_NAME);
  }

  private _parse = () => {
    this.runSafely(() => {
      const roots = this.getRoots();
      const routers: Array<Router> = routersFromRootElements(roots);

      this.componentData = createTreeFromElements(roots, treeRenderOptions).tree;
      this.routesData = routers.map(parseRoutes);

      roots.map(root => parseModulesFromRootElement(root, this.ngModulesData));
      routers.forEach(router => parseModulesFromRouter(router, this.ngModulesData));
    });
    console.info('parsing...');
  }

  public connect = () => {
    this.connected = true;
    this.runSafely(() => {
      this.bindToRoots();
      this._parse();
    });
  }

  private bindToRoots = () => {
    this.getRoots().forEach(root => this.bind(root));
  }

  private bind = (root) => {
    if (root.injector == null) {
      // If injector is missing, we won't be able to debug this build
      // send(MessageFactory.applicationError(
      //   new ApplicationError(ApplicationErrorType.DebugInformationMissing)));
      return;
    }

    const ngZone = root.injector.get(ng.coreTokens.NgZone);
    if (ngZone) {
      ngZone.onStable.subscribe(this._parse.bind(this));
    }
  }
}

// We do not store component instance properties on the node itself because
// we do not want to have to serialize them across backend-frontend boundaries.
// So we look them up using ng.probe, and only when the node is selected.
const getComponentInstance = (tree: MutableTree, node: Node) => {
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      return instanceWithMetadata(probed, node, probed.componentInstance);
    }
  }
  return null;
};

const updateNode = (tree: MutableTree, path: Path, fn: (element) => void) => {
  const node = getNodeFromPartialPath(tree, path);
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      const ngZone = probed.injector.get(ng.coreTokens.NgZone);

      ngZone.run(() => fn(probed));
    }
  }
};

const updateProperty = (tree: MutableTree, path: Path, newValue) => {
  updateNode(tree, path, probed => {
    const instanceParent = getNodeInstanceParent(probed, path);
    if (instanceParent) {
      instanceParent[path[path.length - 1]] = newValue;
    }
  });
};

const updateProviderProperty = (tree: MutableTree, path: Path, token: string, propertyPath: Path, newValue) => {
  updateNode(tree, path, probed => {
    const provider = getNodeProvider(probed, token, propertyPath);
    if (provider) {
      provider[propertyPath[propertyPath.length - 1]] = newValue;
    }
  });
};

const emitValue = (tree: MutableTree, path: Path, newValue) => {
  const node = getNodeFromPartialPath(tree, path);
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      const instanceParent = getNodeInstanceParent(probed, path);
      if (instanceParent) {
        const ngZone = probed.injector.get(ng.coreTokens.NgZone);
        ngZone.run(() => {
          const emittable = instanceParent[path[path.length - 1]];
          if (typeof emittable.emit === 'function') {
            emittable.emit(newValue);
          } else if (typeof emittable.next === 'function') {
            emittable.next(newValue);
          } else {
            throw new Error(`Cannot emit value for ${serializePath(path)}`);
          }
        });
      }
    }
  }
};

export const routersFromRoots = (rootElements) => {
  const routers = [];

  for (const rootDebugElement of rootElements) {
    const routerFn = parameterTypes(rootDebugElement.componentInstance).reduce((prev, curr, idx, p) =>
      prev ? prev : p[idx].name === 'Router' ? p[idx] : null, null);
    if (routerFn &&
        rootDebugElement.componentInstance.router &&
        rootDebugElement.componentInstance.router instanceof Router) {
      routers.push(rootDebugElement.componentInstance.router);
    }
  }

  return routers;
};

export const routersFromRootElements = (rootElements): Array<Router> => {
  let routers = new Array<any>();

  if (ng.coreTokens.Router) {
    for (const rootElement of rootElements) {
      routers = routers.concat(rootElement.injector.get(ng.coreTokens.Router));
    }
  } else {
    for (const router of routersFromRoots(rootElements)) {
      routers = routers.concat(router);
    }
  }

  return routers;
};
