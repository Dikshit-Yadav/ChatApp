import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../contex/socket";
import { useChatStore } from "../store/chatStore";
import { Timer } from "lucide-react";

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
  const [scheduleDelay, setScheduleDelay] = useState<number | null>(null);
const [showTimer, setShowTimer] = useState(false);

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

  // join room
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
  // const handleSend = async () => {
  //   if (!newMessage.trim() || !conversationId) return;

  //   await sendMessage(conversationId, newMessage);
  //   setNewMessage("");
  // };

  const handleSend = async () => {
  if (!newMessage.trim() || !conversationId) return;

  const messageToSend = newMessage;

  setNewMessage("");

  if (scheduleDelay) {
    setShowTimer(false);

    setTimeout(async () => {
      await sendMessage(conversationId, messageToSend);
    }, scheduleDelay * 1000);

    setScheduleDelay(null);
    return;
  }

  await sendMessage(conversationId, messageToSend);
};

 return (
  <div className="flex-1 flex flex-col h-screen bg-gray-100 ">

    {/* header */}
    <div className="sticky top-0 z-10 bg-white  p-4 flex items-center gap-3 shadow-sm">
      {conversationUser && (
        <>
          <img
            src={conversationUser.profilePic || "https://i.pravatar.cc/40"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800">
              {conversationUser.username}
            </h3>
            <span className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </>
      )}
    </div>

    {/* messages */}
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {messages.map((msg) => {
        const me = isMe(msg);

        return (
          <div
            key={msg._id}
            className={`flex items-end gap-2 ${
              me ? "justify-end" : "justify-start"
            }`}
          >

            <div className="flex flex-col max-w-[70%]">
              <div
                className={`px-4 py-2 rounded-2xl text-sm shadow ${
                  me
                    ? "bg-teal-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>

              <span
                className={`text-xs mt-1 ${
                  me ? "text-right text-gray-300" : "text-gray-400"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      })}

      {/* typing effect */}
      {typing && (
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow text-gray-500 animate-pulse pr-b-15">
            typing...
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* input */}
    <div className="p-3 bg-white flex items-center gap-2 shadow-md relative">

  {/* Timer button */}
  <button
    onClick={() => setShowTimer(!showTimer)}
    className="p-2 hover:bg-gray-100 rounded-full"
  >
    <Timer size={20} />
  </button>

  {/* Timer dropdown */}
  {showTimer && (
    <div className="absolute bottom-14 left-3 bg-white shadow-lg rounded-lg p-2 flex gap-2">
      {[5, 10, 30].map((sec) => (
        <button
          key={sec}
          onClick={() => setScheduleDelay(sec)}
          className={`px-2 py-1 text-sm rounded ${
            scheduleDelay === sec ? "bg-teal-500 text-white" : "bg-gray-100"
          }`}
        >
          {sec}s
        </button>
      ))}
    </div>
  )}

  <input
    value={newMessage}
    onChange={(e) => {
      setNewMessage(e.target.value);
      handleTyping();
    }}
    onKeyDown={(e) => e.key === "Enter" && handleSend()}
    className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
    placeholder={
      scheduleDelay
        ? `Message will send in ${scheduleDelay}s...`
        : "Type a message..."
    }
  />

  <button
    onClick={handleSend}
    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full shadow"
  >
    Send
  </button>
</div>
    
  </div>
);
};

export default ChatPanel;