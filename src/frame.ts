const injectBackend = (webview) => injectScript(webview, 'build/backend.js');

const injectScript = (webview, scriptPath) => {
  webview.executeScript({
    code: `var script = document.createElement('script');
           script.src = '${scriptPath}';
           document.documentElement.appendChild(script);
           script.parentNode.removeChild(script);`,
  });
};

// load webpage to inspect in webview and inject backend
const loadURLAndInjectAppParserInWebview = (URL: string, webview) => {
  // ...
};

// special magic to load Augury into the webview from local files
const loadAuguryInWebview = (webview) => {
  loadLocalFile('frontend.html', 'text/html', (response) => {
    webview.src = response;
    setTimeout(() => loadLocalFile('build/frontend.js', 'text/javscript',
      (scriptResponse) => injectScript(webview, scriptResponse)));
  });

  // init handshake after "loaded" signal from Augury UI (same )
  webview.addEventListener('consolemessage', function(event) {
    console.debug('AUGURY CONSOLE MSG:', event);
    if (event.message === 'LISTENER_LOADED') {
      console.debug('Posting handshake message to Augury...');
      window.addEventListener('message', function(event) {
        console.log('window received message from Augury:', event.data);
      });
      webview.contentWindow.postMessage('HANDSHAKE', '*');
    }
  });
};

const loadLocalFile = (filename, type, fn) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', filename, true);
  xhr.responseType = 'blob';
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const blob = new Blob([this.response], {type: type});
      fn(window.URL.createObjectURL(blob));
    }
  };
  xhr.send();
};

loadAuguryInWebview(document.getElementById('augury_ui'));
