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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loggedInUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;

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

            setMessages(conversation.messages || []);
        } catch (err) {
            console.error("Error fetching conversation info", err);
        }
    };

    fetchConversation();
}, [conversationId, loggedInUserId]);

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

    useEffect(() => {
        socket.on("new-message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off("new-message");
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !conversationId) return;

        try {
            const res = await conversationApi.sendMessage(conversationId, {
                text: newMessage,
            });
            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
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
                        <img
                            src={conversationUser.profilePic || "https://i.pravatar.cc/40"}
                            alt={conversationUser.username}
                            className="w-10 h-10 rounded-full"
                        />
                        <h3 className="text-lg font-semibold text-gray-700">
                            {conversationUser.username}
                        </h3>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId._id === loggedInUserId;
                    return (
                        <div
                            key={msg._id}
                            className={`flex max-w-[70%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                        >
                            <div className="flex flex-col">
                                <div
                                    className={`p-2 rounded-xl ${isMe ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-800"
                                        }`}
                                >
                                    {msg.message}
                                </div>
                                <span className={`text-xs text-gray-400 ${isMe ? "self-end" : "self-start"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-full outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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