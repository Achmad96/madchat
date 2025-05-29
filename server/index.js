const express = require('express');
const { createServer } = require('node:http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const app = express();
const routes = require('./routes.js');
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', routes);
app.set('io', io);

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'http://localhost';

server.listen(PORT, () => {
  console.log(`
  App is listening on port ${PORT}
  Click here to open in browser: ${BASE_URL}:${PORT}
  Press Ctrl+C to stop the server
  `);
});

module.exports = { app, io };
