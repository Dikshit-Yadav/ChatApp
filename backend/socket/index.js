let onlineUsers = new Map();

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    const user = socket.request.session?.user;

    if (!user) {
      console.log("No session user");
      return;
    }

    const userId = user.id.toString();

    onlineUsers.set(userId, socket.id);
    console.log("User connected:", userId);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log("User disconnected:", userId);
    });
  });
};

export const getReceiverSocket = (userId) => {
  return onlineUsers.get(userId.toString());
};

export const getOnlineUsers = () => {
  
  return onlineUsers;
};

export const setOnlineUsers = (users) => {
  onlineUsers = users;
};
