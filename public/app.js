(function() {
  const messages = document.querySelector('#messages');
  const wsButton = document.querySelector('#wsButton');
  const wsSendButton = document.querySelector('#wsSendButton');

  function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }

  let ws;

  wsButton.onclick = function() {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    ws = new WebSocket(`ws://${location.host}`);
    ws.onerror = function() {
      showMessage('WebSocket error');
    };
    ws.onopen = function() {
      showMessage('WebSocket connection established');
    };
    ws.onclose = function() {
      showMessage('WebSocket connection closed');
      ws = null;
    };
  };

  wsSendButton.onclick = function() {
    if (!ws) {
      showMessage('No WebSocket connection');
      return;
    }

    ws.send('Hello World!');
    showMessage('Sent "Hello World!"');
  };
})();
