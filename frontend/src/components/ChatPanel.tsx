import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../contex/socket";
import { useChatStore } from "../store/chatStore";

const ChatPanel = () => {
  const { conversationId } = useParams();

  const {
    messages,
    conversationUser,
    typing,
    onlineUsers,
    fetchMessages,
    fetchConversation,
    sendMessage,
    setupSocketListeners,
  } = useChatStore();

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loggedInUserId = JSON.parse(
    localStorage.getItem("user") || "{}"
  )._id;

  const isOnline = conversationUser
    ? onlineUsers.includes(conversationUser._id)
    : false;

  const isMe = (msg: any) => {
    const senderId =
      typeof msg.senderId === "string"
        ? msg.senderId
        : msg.senderId._id;
    return senderId === loggedInUserId;
  };

  // fetch data
  useEffect(() => {
    if (!conversationId) return;

    fetchConversation(conversationId, loggedInUserId);
    fetchMessages(conversationId);
  }, [conversationId]);

  // socket setup
  useEffect(() => {
    setupSocketListeners();
  }, []);

  // jJoin room
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join-conversation", { conversationId });

    return () => {
      socket.emit("leave-conversation", { conversationId });
    };
  }, [conversationId]);

  // go on last msg
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // typing 
  const handleTyping = () => {
    socket.emit("typing", { conversationId });

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { conversationId });
    }, 1500);
  };

  // send message
  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;

    await sendMessage(conversationId, newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-screen border-l">
      
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        {conversationUser && (
          <>
            <img
              src={
                conversationUser.profilePic ||
                "https://i.pravatar.cc/40"
              }
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold">
                {conversationUser.username}
              </h3>
              {isOnline && (
                <span className="text-green-500 text-sm">
                  Online
                </span>
              )}
            </div>
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
              className={`max-w-[70%] ${
                me ? "self-end" : "self-start"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  me
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {msg.message}
              </div>

              <span className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}

        {typing && (
          <div className="text-gray-500 animate-pulse">
            typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) =>
            e.key === "Enter" && handleSend()
          }
          className="flex-1 border px-3 py-2 rounded-full"
          placeholder="Type a message..."
        />

        <button
          onClick={handleSend}
          className="bg-teal-600 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;