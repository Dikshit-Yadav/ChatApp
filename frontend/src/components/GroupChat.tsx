import { useEffect, useRef, useState } from "react";
import { socket } from "../contex/socket";
import { conversationApi } from "../services/conversationAPI";

export default function GroupChat({ group, onInvite }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loggedInUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    );
    //   console.log(loggedInUser.profilePic)
    const isMe = (msg: any) => {
        const senderId =
            typeof msg.senderId === "object"
                ? msg.senderId._id
                : msg.senderId;

        return senderId === loggedInUser._id;
    };

    useEffect(() => {
        if (!group) return;
        setMessages([]);
        socket.emit("join-conversation", {
            conversationId: group._id,
        });

        const handleMessage = (msg: any) => {
            if (msg.conversationId === group._id) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("receive-message", handleMessage);

        return () => {
            socket.emit("leave-conversation", {
                conversationId: group._id,
            });

            socket.off("receive-message", handleMessage);
        };
    }, [group]);

    useEffect(() => {
        if (!group) return;

        const fetchMessages = async () => {
            try {
                const res = await conversationApi.getMessages(group._id);
                console.log("API MESSAGES:", res.data);
                setMessages(res.data || []);
            } catch (err) {
                console.error("Error fetching messages", err);
            }
        };

        fetchMessages();
    }, [group]);

    // auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim() || !group) return;

        socket.emit("send-message", {
            conversationId: group._id,
            message: text,
        });

        setText("");
    };

    if (!group) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a group
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-gray-100">

            <div className="sticky top-0 z-10 bg-white p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                        {group.groupName?.[0]?.toUpperCase()}
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800">
                            {group.groupName}
                        </h3>
                        <span className="text-xs text-gray-400">
                            Group chat
                        </span>
                    </div>
                </div>

                <button
                    onClick={onInvite}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-full text-sm"
                >
                    + Add
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((m, i) => {
                    const me = isMe(m);
                    const sender = m.senderId;

                    if (!m.message) return null;

                    return (
                        <div key={i} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                            <div className="flex items-end gap-2 max-w-[70%]">

                                {!me && (
                                    <img
                                        src={sender?.profilePic || "https://i.pravatar.cc/40"}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}

                                <div>
                                    {!me && (
                                        <div className="text-xs text-gray-500">
                                            {sender?.username}
                                        </div>
                                    )}

                                    <div className={`px-4 py-2 rounded-xl ${me ? "bg-teal-500 text-white" : "bg-white"
                                        }`}>
                                        {m.message}
                                    </div>
                                </div>

                                {me && (
                                    <img
                                        src={loggedInUser.profilePic || "https://i.pravatar.cc/40"}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}

                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white flex items-center gap-2 shadow-md">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Type a message..."
                />

                <button
                    onClick={sendMessage}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full shadow"
                >
                    Send
                </button>
            </div>
        </div>
    );
}