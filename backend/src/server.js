const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing!');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Bind io to app for access in controllers
app.set('io', io);

require('./sockets/socket')(io);

require('./sockets/socket')(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
