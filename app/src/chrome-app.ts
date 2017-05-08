const CHROME_EXTENSION_ID = 'pibldekncolopjicbocdcpeecedgjomj';

const MAIN_WINDOW_ID = 'MAIN_WINDOW';

let mainWindow;

const openAppWindow = () => {
  if (!mainWindow) {
    createWindow('frame.html', (w) => {
      mainWindow = w;
    });
  }
};

const createWindow = (url, cb) => {
  const width = screen.availWidth;
  const height = screen.availHeight;

  (<any>chrome).app.window.create(url, {
    id: MAIN_WINDOW_ID,
    outerBounds: {
      width: screen.availWidth,
      height: screen.availHeight,
      left: 0,
      top: 0,
    }
  }, cb);
};

// triggered by the extensino when someone clicks on Augury button in a tab...
chrome.runtime.onMessageExternal.addListener(openAppWindow);

// triggered when app is run from launcher or other...
(<any>chrome).app.runtime.onLaunched.addListener(openAppWindow);
