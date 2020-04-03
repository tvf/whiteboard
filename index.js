'use strict';

const express = require('express');
const http = require('http');
const uuid = require('uuid');

const WebSocket = require('ws');

const app = express();
const map = new Map();

//
// Serve static files from the 'public' folder.
//
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', function(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function(ws) {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', function(ws, request) {
  const userId = uuid.v4();

  map.set(userId, ws);

  ws.on('message', function(message) {
    console.log(`Received message ${message} from user ${userId}`);
  });

  ws.on('close', function() {
    map.delete(userId);
  });
});

//
// Start the server.
//
server.listen(8080, function() {
  console.log('Listening on http://localhost:8080');
});
