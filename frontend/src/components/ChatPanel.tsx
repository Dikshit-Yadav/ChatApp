import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { conversationApi } from "../services/conversationAPI";
import { socket } from "../contex/socket";

interface Message {
    _id: string;
    senderId: { _id: string; username: string; profilePic?: string };
    message: string;
    createdAt: string;
}

interface User {
    _id: string;
    username: string;
    profilePic?: string;
}

const ChatPanel = () => {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationUser, setConversationUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [typing, setTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const loggedInUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;

    const isOnline = conversationUser
        ? onlineUsers.includes(conversationUser._id)
        : false;
    const isMe = (msg: Message) => {
        const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;
        return senderId === loggedInUserId;
    };
    useEffect(() => {
        const fetchConversation = async () => {
            if (!conversationId) return;

            try {
                const res = await conversationApi.getConversation(conversationId);
                const conversation = res.data;
                if (!conversation.isGroup) {
                    const otherUser = conversation.members.find(
                        (m: User) => m._id !== loggedInUserId
                    );
                    setConversationUser(otherUser || null);
                }
            } catch (err) {
                console.error("Error fetching conversation info", err);
            }
        };
        fetchConversation();
    }, [conversationId, loggedInUserId]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId) return;
            try {
                const res = await conversationApi.getMessages(conversationId);
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages", err);
            }
        };
        fetchMessages();
    }, [conversationId]);

    // Join  room
    useEffect(() => {
        if (!conversationId) return;
        socket.emit("join-conversation", { conversationId });

        return () => {
            socket.emit("leave-conversation", { conversationId });
        };
    }, [conversationId]);

    // for new messages
    useEffect(() => {
        socket.on("new-message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off("new-message");
    }, []);

    useEffect(() => {
        socket.on("online-users", (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("online-users");
        };
    }, []);

    // for typing events
    useEffect(() => {
        socket.on("user-typing", () => setTyping(true));
        socket.on("user-stop-typing", () => setTyping(false));

        return () => {
            socket.off("user-typing");
            socket.off("user-stop-typing");
        };
    }, []);

    // go to new messages 
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // handle typing
    const handleTyping = () => {
        socket.emit("typing", { conversationId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop-typing", { conversationId });
        }, 1500);
    };

    // send message
    const handleSend = async () => {
        if (!newMessage.trim() || !conversationId) return;

        try {
            const res = await conversationApi.sendMessage(conversationId, {
                text: newMessage,
            });
            setMessages((prev) => [
                ...prev,
                {
                    ...res.data,
                    senderId:
                        typeof res.data.senderId === "string"
                            ? { _id: res.data.senderId } 
                            : res.data.senderId,
                },
            ]);
            setNewMessage("");
            socket.emit("stop-typing", { conversationId });
        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-screen border-l border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                {conversationUser && (
                    <>
                        <div className="relative w-10 h-10">
                            <img
                                src={conversationUser?.profilePic || "https://i.pravatar.cc/40"}
                                alt={conversationUser?.username}
                                className="w-10 h-10 rounded-full"
                            />
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-700">
                            {conversationUser.username}
                        </h3>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

                {messages.map((msg) => {
                    const me = isMe(msg);
                    return (
                        <div
                            key={msg._id}
                            className={`flex max-w-[70%] ${me ? "self-end flex-row-reverse" : "self-start"}`}
                        >
                            <div className="flex flex-col">
                                <div className={`p-2 rounded-xl ${me ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                                    {msg.message}
                                </div>
                                <span className={`text-xs text-gray-400 ${me ? "self-end" : "self-start"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {typing && (
                    <div className="flex items-center ml-2 ">
                        <span className="animate-pulse text-black text-lg mb-5">...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-full outline-none"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;