(function() {
  const messages = document.querySelector('#messages');
  // const wsButton = document.querySelector('#wsButton');
  // const wsSendButton = document.querySelector('#wsSendButton');
  const whiteboard = document.querySelector('#whiteboard');
  const whiteboard_ctx = whiteboard.getContext('2d');
  const name_input = document.querySelector('#username');

  const artist_locations = new Map();
  let dirty = true;
  let queued_draws = false;

  let mouse_state = {
    button_down: false,
    middle_button_down: false,
    last_position: null,
    dirty: false
  };

  function showMessage(message) {
    // messages.textContent += `\n${message}`;
    // messages.scrollTop = messages.scrollHeight;
  }

  let ws;

  function open_websocket() {
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
      showMessage(message.data);
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

  // wsSendButton.onclick = function() {
  //   if (!ws) {
  //     showMessage('No WebSocket connection');
  //     return;
  //   }
  //   let penstrokes = [{
  //     start: [0, 0, 20],
  //     end: [1000, 0, 30],
  //     colour: [127, 127, 127]
  //   }];
  //   ws.send(JSON.stringify(penstrokes));
  // };

  whiteboard.mouseout = function (event) {
    mouse_state.button_down = false;
    mouse_state.middle_button_down = false;
    mouse_state.last_position = null;
  };

  whiteboard.onmousedown = function (event) {

    if (event.button == 0) {
      mouse_state.button_down = true;
    }

    if (event.button == 1) {
      mouse_state.middle_button_down = true;
    }
    // mouse_state.last_position = [event.clientX, event.clientY];
  };

  whiteboard.onmouseup = function (event) {

    if (event.button == 0) {
      mouse_state.button_down = false;
    }

    if (event.button == 1) {
      mouse_state.middle_button_down = false;
    }
  };

  whiteboard.onmousemove = function(event) {
    const rect = whiteboard.getBoundingClientRect()
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    mouse_state.last_position = [x, y];
    mouse_state.dirty = true;
    // update artist location
  };

  // once per frame, render the current state of the app,
  // and send everything drawn since last frame to the server

  function clear_canvas() {
    whiteboard_ctx.fillStyle = 'rgb(127, 127, 127)';
    whiteboard_ctx.fillRect(0,0,640,480);
  }

  function draw_penstrokes() {
    // TODO
  }

  function draw_artist_locations() {
    whiteboard_ctx.fillStyle = 'rgb(63, 63, 63)';
    
    artist_locations.forEach((position, name) => {
      whiteboard_ctx.fillRect(position[0], position[1], 2, 2);
      whiteboard_ctx.font = '10px sans';
      whiteboard_ctx.fillText(name, position[0] + 2, position[1] - 1);
    });
  }

  function render(now) {

    if (dirty) {
      clear_canvas();
      draw_penstrokes();
      draw_artist_locations();

      dirty = false;
    }

    if (queued_draws) {
      // TODO ship queued draws to server
    }

    if (ws && mouse_state.dirty) {  // zomg every frame? this is bad

      let artist_location = {
        type: "artist location",
        name: "",  // TODO your name here
        position: mouse_state.last_position,
      };

      ws.send(JSON.stringify(artist_location));

      mouse_state.dirty = false;
    }
    // TODO ship own artist location to the server
    
    requestAnimationFrame(render);
  }

  open_websocket();

  requestAnimationFrame(render);
})();