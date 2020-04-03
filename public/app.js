(function() {
  const messages = document.querySelector('#messages');
  const wsButton = document.querySelector('#wsButton');
  const wsSendButton = document.querySelector('#wsSendButton');
  const whiteboard = document.querySelector('#whiteboard');
  const whiteboard_ctx = whiteboard.getContext('2d');

  const artist_locations = new Map();
  let dirty = true;

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

    ws.onmessage = function(message) {
      let content = JSON.parse(message.data);

      if (content.type === 'artist location') {
        if (content.hasOwnProperty('position')) {
          artist_locations.set(content.name, content.position);
        } else {
          artist_locations.delete(content.name);
        }

        dirty = true;
      }
    };
  };

  wsSendButton.onclick = function() {
    if (!ws) {
      showMessage('No WebSocket connection');
      return;
    }

    let penstrokes = [{
      start: [0, 0, 20],
      end: [1000, 0, 30],
      colour: [127, 127, 127]
    }];

    ws.send(JSON.stringify(penstrokes));

    showMessage('Sent "Hello World!"');
  };

  function render(now) {

    if (dirty) {

      whiteboard_ctx.fillStyle = 'rgb(127, 127, 127)';
      whiteboard_ctx.fillRect(0,0,640,480);

      whiteboard_ctx.fillStyle = 'rgb(255, 0, 0)';
      artist_locations.forEach((position) => {
        whiteboard_ctx.fillRect(position[0], position[1], 1, 1);
      }); // TODO text?

      dirty = false;
    }
    
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();