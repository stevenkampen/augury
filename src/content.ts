import { currentPlatform } from './utils/platform';

const inject = (fn: (element: HTMLScriptElement) => void) => {
  const script = document.createElement('script');
  fn(script);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
};

const injectScript = (path: string) => {

  inject(script => {
    script.src = currentPlatform.extension.getURL(path);
  });
};

export const injectString = (str: string) => inject(script => script.textContent = str);

const getLocalFileAsString = path => {
  return new Promise((resolve, reject) => {

    var http = new XMLHttpRequest();
    http.open('GET', currentPlatform.extension.getURL(path), true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'text/javascript');
    // http.addEventListener('load', () => {
    //   console.debug('http load event fired...');
    //   resolve(this.responseText);
    // });

    http.onreadystatechange = function() {
      if (http.readyState === 4) {
        if (http.status < 300) {
          resolve(http.response);
        } else if (http.status > 299) {
          reject(http.status);
        }
      }
    }
    http.send();
  });
};


window.addEventListener('message', function(event) {
  if (event.source === window) {
    console.debug('Got message event:', event);
  }
});

getLocalFileAsString('backend.js').then((backendAsString: string) => injectString(backendAsString));

// injectFileAsString('backend.js');
// injectScript('./backend.js');
// injectString(`console.debug('getAllAngularRootElements():', getAllAngularRootElements())`);