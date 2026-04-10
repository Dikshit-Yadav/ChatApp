const onlineUsers = new Map();
import Message from "../models/Message.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    const user = socket.request.session?.user;

    if (!user) {
      console.log("Unauthorized socket, disconnecting...");
      return socket.disconnect(true);
    }

    const userId = user.id.toString();
    console.log("User connected:", userId, socket.id);

    //  STORE MULTIPLE SOCKETS
    const existingSockets = onlineUsers.get(userId) || [];
    onlineUsers.set(userId, [...existingSockets, socket.id]);

    //  EMIT ONLINE USERS
    io.emit("online-users", Array.from(onlineUsers.keys()));

    //  JOIN CONVERSATION (GROUP + PRIVATE)
    socket.on("join-conversation", ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`${userId} joined ${conversationId}`);
    });

    socket.on("leave-conversation", ({ conversationId }) => {
      socket.leave(conversationId);
    });

    //  SEND MESSAGE (GROUP READY)
    socket.on("send-message", async ({ conversationId, message }) => {
      try {
        const newMessage = await Message.create({
          senderId: userId,
          conversationId,
          message,
        });

        const populatedMsg = await newMessage.populate(
          "senderId",
          "username profilePic"
        );

        io.to(conversationId).emit("receive-message", 
          populatedMsg
        );
      } catch (err) {
        console.log("Message error:", err.message);
      }
    });

    //  GROUP INVITE REAL-TIME
    socket.on("send-group-invite", ({ receiverId, invite }) => {
      const sockets = onlineUsers.get(receiverId) || [];

      sockets.forEach((sockId) => {
        io.to(sockId).emit("group-invite", invite);
      });
    });

    //  TYPING
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-typing", {
        userId,
      });
    });

    socket.on("stop-typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-stop-typing", {
        userId,
      });
    });

    //  DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);

      const sockets =
        (onlineUsers.get(userId) || []).filter((id) => id !== socket.id);

      if (sockets.length > 0) {
        onlineUsers.set(userId, sockets);
      } else {
        onlineUsers.delete(userId);
      }

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
};


//  HELPERS (FIXED)

//  REMOVE THIS (single socket)
// export const getReceiverSocket = (userId) => ...

//  USE THIS
export const getReceiverSockets = (userId) => {
  return onlineUsers.get(userId.toString()) || [];
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};