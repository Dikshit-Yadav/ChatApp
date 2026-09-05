import redisClient from "../config/redisClient.js";
import Message from "../models/Message.js";

const ONLINE_USERS_KEY = "online-users";

// Redis Hash helpers for online users
const addOnlineSocket = async (userId, socketId) => {
    const existing = await redisClient.hget(ONLINE_USERS_KEY, userId);
    const sockets = existing ? JSON.parse(existing) : [];
    if (!sockets.includes(socketId)) {
        sockets.push(socketId);
    }
    await redisClient.hset(ONLINE_USERS_KEY, userId, JSON.stringify(sockets));
};

const removeOnlineSocket = async (userId, socketId) => {
    const existing = await redisClient.hget(ONLINE_USERS_KEY, userId);
    if (!existing) return;
    const sockets = JSON.parse(existing).filter((id) => id !== socketId);
    if (sockets.length > 0) {
        await redisClient.hset(ONLINE_USERS_KEY, userId, JSON.stringify(sockets));
    } else {
        await redisClient.hdel(ONLINE_USERS_KEY, userId);
    }
};

const getAllOnlineUserIds = async () => {
    const keys = await redisClient.hkeys(ONLINE_USERS_KEY);
    return keys;
};

const getUserSockets = async (userId) => {
    const data = await redisClient.hget(ONLINE_USERS_KEY, userId.toString());
    return data ? JSON.parse(data) : [];
};

export const initSocket = (io) => {
    io.on("connection", async (socket) => {
        const user = socket.request.session?.user;

        if (!user) {
            console.log("Unauthorized socket, disconnecting...");
            return socket.disconnect(true);
        }

        const userId = (user._id || user.id).toString();
        console.log("User connected:", userId, socket.id);

        // STORE SOCKET IN REDIS
        await addOnlineSocket(userId, socket.id);

        // EMIT ONLINE USERS
        const onlineUserIds = await getAllOnlineUserIds();
        io.emit("online-users", onlineUserIds);

        // ALLOW CLIENT TO REQUEST CURRENT ONLINE LIST (Sync fix)
        socket.on("get-online-users", async () => {
            const users = await getAllOnlineUserIds();
            socket.emit("online-users", users);
        });

        // JOIN CONVERSATION (GROUP + PRIVATE)
        socket.on("join-conversation", ({ conversationId }) => {
            socket.join(conversationId);
            console.log(`${userId} joined ${conversationId}`);
        });

        socket.on("leave-conversation", ({ conversationId }) => {
            socket.leave(conversationId);
        });

        // SEND MESSAGE (GROUP READY)
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

        // DELETE MESSAGE EVERYONE BROADCAST
        socket.on("delete-message-everyone", ({ conversationId, messageId }) => {
            io.to(conversationId).emit("message-deleted-everyone", {
                messageId,
            });
        });

        // GROUP INVITE REAL-TIME
        socket.on("send-group-invite", async ({ receiverId, invite }) => {
            const sockets = await getUserSockets(receiverId);

            sockets.forEach((sockId) => {
                io.to(sockId).emit("group-invite", invite);
            });
        });

        // TYPING
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

        // DISCONNECT
        socket.on("disconnect", async () => {
            console.log("User disconnected:", userId);

            await removeOnlineSocket(userId, socket.id);

            const onlineUserIds = await getAllOnlineUserIds();
            io.emit("online-users", onlineUserIds);
        });
    });
};


// HELPERS

// USE THIS — reads from Redis
export const getReceiverSockets = async (userId) => {
    return await getUserSockets(userId);
};

export const getOnlineUsers = async () => {
    return await getAllOnlineUserIds();
};