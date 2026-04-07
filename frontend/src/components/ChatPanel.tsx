import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { conversationApi } from "../services/conversationAPI";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    profilePic?: string;
  };
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
  console.log(loggedInUserId)

  // fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await conversationApi.getMessages(conversationId!);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };
    if (conversationId) fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const fetchConversationUser = async () => {
      try {
        const res = await conversationApi.getConversation(conversationId!);
        const conversations = res.data.conversations;

        if (conversations && conversations.length > 0) {
          const conversation = conversations.find((c: any) => c._id === conversationId) || conversations[0];

          if (conversation.members && conversation.members.length > 0) {
            const otherUser = conversation.members.find((m: User) => m._id !== loggedInUserId);
            setConversationUser(otherUser || null);
          } else {
            console.error("Conversation members not found in selected conversation:", conversation);
          }
        } else {
          console.error("No conversations returned from API:", res.data);
        }
      } catch (err) {
        console.error("Error fetching conversation info", err);
      }
    };

    if (conversationId) fetchConversationUser();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await conversationApi.sendMessage(conversationId!, { text: newMessage });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-screen border-l border-gray-200">
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

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
  {messages.map((msg) => {
    const isMe = msg.senderId === loggedInUserId;
    console.log(isMe)
    return (
      <div
        key={msg._id}
        className={`flex items-end gap-2 max-w-[70%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`
        }
      >
        <div className="flex flex-col">
          <div className={`p-2 rounded-xl ${isMe ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            <p className="text-sm">{msg.message}</p>
          </div>
          <span className="text-xs text-gray-400 self-end">
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>
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