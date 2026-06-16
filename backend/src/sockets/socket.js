let onlineUsers = new Set();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    onlineUsers.add(socket.id);

    // Broadcast updated online count to admins
    io.to('admin').emit('onlineUsersCount', onlineUsers.size);

    // Join a room based on userId for targeted notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Admin joins admin room
    socket.on('joinAdmin', () => {
      socket.join('admin');
      socket.emit('onlineUsersCount', onlineUsers.size); // Send initial count
      console.log('Admin joined admin room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      onlineUsers.delete(socket.id);
      io.to('admin').emit('onlineUsersCount', onlineUsers.size);
    });
  });
};
