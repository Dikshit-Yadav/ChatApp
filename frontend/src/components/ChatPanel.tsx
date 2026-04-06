import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { conversationApi } from "../services/conversationAPI";

interface Message {
  _id: string;
  sender: string;
  text: string;
  createdAt: string;
}

const ChatPanel = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await conversationApi.sendMessage(conversationId!, {
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
      {/* Messages Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg._id} className={`p-2 rounded-xl max-w-[70%] ${msg.sender === "me" ? "bg-teal-100 self-end" : "bg-gray-100 self-start"}`}>
            <p className="text-sm text-gray-700">{msg.text}</p>
            <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
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