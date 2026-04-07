const onlineUsers = new Map();

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    const user = socket.request.session?.user;
    if (!user) return socket.disconnect(true);

    const userId = user.id.toString();
    const existing = onlineUsers.get(userId) || [];
    onlineUsers.set(userId, [...existing, socket.id]);

    // Broadcast online users
    io.emit("online-users", Array.from(onlineUsers.keys()));

    // Join conversation
    socket.on("join-conversation", ({ conversationId }) => socket.join(conversationId));
    socket.on("leave-conversation", ({ conversationId }) => socket.leave(conversationId));

    // Typing
    socket.on("typing", ({ conversationId }) =>
      socket.to(conversationId).emit("user-typing")
    );
    socket.on("stop-typing", ({ conversationId }) =>
      socket.to(conversationId).emit("user-stop-typing")
    );

    // Disconnect
    socket.on("disconnect", () => {
      const sockets = (onlineUsers.get(userId) || []).filter((id) => id !== socket.id);
      if (sockets.length > 0) onlineUsers.set(userId, sockets);
      else onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
};

export const getReceiverSocket = (userId) => {
    const sockets = onlineUsers.get(userId.toString());
    return sockets?.[0] || null;
};

export const getReceiverSockets = (userId) => {
    return onlineUsers.get(userId.toString()) || [];
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());