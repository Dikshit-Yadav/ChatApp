import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../contex/socket";
import { useChatStore } from "../store/chatStore";
import { conversationApi } from "../services/conversationAPI";
import { getProfile } from "../services/profileAPI";
import { Timer, Smile, Trash2, MoreVertical, User, Trash, X, Mail, Phone, Calendar, Shield, Paperclip, FileText, Film, Music, File } from "lucide-react";
import { toast } from "react-toastify";
import { FileMessageContent, formatFileSize } from "./FileMessageContent";

interface UserDetails {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  createdAt?: string;
}

const ChatPanel = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    messages,
    conversationUser,
    typing,
    onlineUsers,
    fetchMessages,
    fetchConversation,
    sendMessage,
    sendFileMessage,
    setupSocketListeners,
    toggleReaction,
    deleteMessageForEveryone,
    deleteMessageForMe,
  } = useChatStore();

  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [activeDeleteMenu, setActiveDeleteMenu] = useState<string | null>(null);

  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const blockedExtensions = [".exe", ".bat", ".cmd", ".sh", ".msi", ".vbs", ".scr", ".jar", ".com", ".ps1"];
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_FILES_COUNT = 5;

    if (selectedFiles.length + filesArray.length > MAX_FILES_COUNT) {
      toast.error(`Maximum ${MAX_FILES_COUNT} files allowed per upload.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validFiles: File[] = [];

    for (const file of filesArray) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (blockedExtensions.includes(ext)) {
        toast.error(`File '${file.name}' is blocked for security reasons.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File '${file.name}' exceeds maximum 25 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    fetchConversation(conversationId, loggedInUserId);
    fetchMessages(conversationId);
  }, [conversationId]);

  useEffect(() => {
    setupSocketListeners();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join-conversation", { conversationId });

    return () => {
      socket.emit("leave-conversation", { conversationId });
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    socket.emit("typing", { conversationId });

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { conversationId });
    }, 1500);
  };

  const handleViewDetails = async () => {
    if (!conversationUser) return;
    setShowHeaderMenu(false);
    setShowUserDetails(true);
    setLoadingDetails(true);

    try {
      const res = await getProfile(conversationUser._id);
      setUserDetails(res.data);
    } catch (err) {
      console.error("Error fetching user details", err);
      setUserDetails({
        _id: conversationUser._id,
        username: conversationUser.username,
        profilePic: conversationUser.profilePic,
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!conversationId) return;
    setDeletingChat(true);

    try {
      await conversationApi.deleteConversation(conversationId);
      toast.success("Chat deleted successfully");
      setShowDeleteConfirm(false);
      navigate("/chat");
    } catch (err) {
      toast.error("Failed to delete chat");
      console.error("Error deleting conversation", err);
    } finally {
      setDeletingChat(false);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !conversationId || uploading) return;

    const messageToSend = newMessage;
    const filesToSend = [...selectedFiles];

    setNewMessage("");
    setSelectedFiles([]);

    if (filesToSend.length > 0) {
      setUploading(true);
      await sendFileMessage(conversationId, filesToSend, messageToSend);
      setUploading(false);
      return;
    }

    if (scheduledTime) {
      const targetTime = new Date(scheduledTime).getTime();
      const now = Date.now();

      const delay = targetTime - now;

      if (delay <= 0) {
        await sendMessage(conversationId, messageToSend);
        setScheduledTime("");
        return;
      }

      setShowTimePicker(false);

      setTimeout(async () => {
        await sendMessage(conversationId, messageToSend);
      }, delay);

      setScheduledTime("");
      return;
    }

    await sendMessage(conversationId, messageToSend);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-100 ">

      <div className="sticky top-0 z-10 bg-white p-4 flex items-center gap-3 shadow-sm">
        {conversationUser && (
          <>
            <img
              src={conversationUser.profilePic || "https://i.pravatar.cc/40"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col flex-1">
              <h3 className="font-semibold text-gray-800">
                {conversationUser.username}
              </h3>
              <span className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="relative" ref={headerMenuRef}>
              <button
                id="chat-header-menu-btn"
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
              >
                <MoreVertical size={20} />
              </button>

              {showHeaderMenu && (
                <div
                  className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-[200px] z-50"
                  style={{
                    animation: "menuSlideIn 0.2s ease-out",
                  }}
                >
                  <button
                    id="view-details-btn"
                    onClick={handleViewDetails}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-3 transition-colors duration-150"
                  >
                    <User size={16} />
                    View Details
                  </button>
                  <div className="mx-3 border-t border-gray-100" />
                  <button
                    id="delete-chat-btn"
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors duration-150"
                  >
                    <Trash size={16} />
                    Delete Chat
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => {
          const me = isMe(msg);

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${me ? "justify-end" : "justify-start"
                }`}
            >

              <div className="flex flex-col max-w-[70%] group relative">
                <div className="relative">
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm shadow ${me
                      ? "bg-teal-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                  >
                    <FileMessageContent msg={msg} isMe={me} />
                  </div>

                  <button
                    onClick={() => {
                      setActivePicker(activePicker === msg._id ? null : msg._id);
                      setActiveDeleteMenu(null);
                    }}
                    className={`absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md rounded-full p-1 text-gray-400 hover:text-teal-500 z-10 ${me ? "-left-8" : "-right-8"
                      }`}
                  >
                    <Smile size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setActiveDeleteMenu(activeDeleteMenu === msg._id ? null : msg._id);
                      setActivePicker(null);
                    }}
                    className={`absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md rounded-full p-1 text-gray-400 hover:text-red-500 z-10 ${me ? "-left-8" : "-right-8"
                      }`}
                  >
                    <Trash2 size={16} />
                  </button>

                  {activeDeleteMenu === msg._id && (
                    <div className={`absolute bottom-8 flex flex-col bg-white shadow-xl rounded-lg z-30 border border-gray-100 py-1 min-w-[140px] ${me ? "right-0" : "left-0"
                      }`}>
                      <button
                        onClick={() => {
                          deleteMessageForMe(msg._id);
                          setActiveDeleteMenu(null);
                        }}
                        className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700 whitespace-nowrap"
                      >
                        Delete for me
                      </button>
                      {me && (
                        <button
                          onClick={() => {
                            deleteMessageForEveryone(msg._id);
                            setActiveDeleteMenu(null);
                          }}
                          className="px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 font-medium whitespace-nowrap"
                        >
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  )}

                  {activePicker === msg._id && (
                    <div className={`absolute -top-12 flex gap-2 bg-white shadow-xl p-2 rounded-full z-20 border border-gray-100 ${me ? "right-0" : "left-0"
                      }`}>
                      {reactionEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            toggleReaction(msg._id, emoji);
                            setActivePicker(null);
                          }}
                          className="hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${me ? "justify-end" : "justify-start"}`}>
                    {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                      const count = msg.reactions.filter((r: any) => r.emoji === emoji).length;
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg._id, emoji)}
                          className="bg-white px-1.5 py-0.5 rounded-full text-[10px] shadow-sm border border-gray-100 flex items-center gap-1 hover:bg-gray-50"
                        >
                          {emoji} <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <span className={`text-xs mt-1 ${me ? "text-right text-gray-300" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex items-center gap-2">
            <div className="bg-white px-4 py-2 rounded-2xl shadow text-gray-500 animate-pulse pr-b-15">
              typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-teal-50 border-t border-teal-100 p-3 flex gap-3 overflow-x-auto items-center">
          {selectedFiles.map((file, idx) => {
            const isImg = file.type.startsWith("image/");
            return (
              <div
                key={idx}
                className="relative bg-white border border-teal-200 rounded-xl p-2 flex items-center gap-2 shadow-sm min-w-[140px] max-w-[200px] flex-shrink-0"
              >
                {isImg ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                    {file.type.startsWith("video/") ? (
                      <Film size={20} />
                    ) : file.type.startsWith("audio/") ? (
                      <Music size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                )}
                <div className="overflow-hidden text-xs flex-1">
                  <p className="font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeSelectedFile(idx)}
                  className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-3 bg-white flex items-center gap-2 shadow-md relative">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-teal-600 transition-colors"
          title="Attach files (Single or Multiple)"
        >
          <Paperclip size={20} />
        </button>

        <button
          onClick={() => setShowTimePicker(!showTimePicker)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Timer size={20} />
        </button>

        {showTimePicker && (
          <div className="absolute bottom-14 left-3 bg-white shadow-lg p-3 rounded-lg flex flex-col gap-2">

            <label className="text-xs text-gray-500">
              Schedule message
            </label>

            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="border p-2 rounded text-sm"
            />

            <button
              onClick={() => setShowTimePicker(false)}
              className="text-xs text-teal-600"
            >
              Done
            </button>
          </div>
        )}

        <input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
          placeholder={
            selectedFiles.length > 0
              ? `Add a caption for ${selectedFiles.length} file(s)...`
              : scheduledTime
                ? `Scheduled for ${new Date(scheduledTime).toLocaleTimeString()}`
                : "Type a message..."
          }
        />

        <button
          onClick={handleSend}
          disabled={uploading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full font-medium text-sm flex items-center justify-center min-w-[70px] disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send"
          )}
        </button>
      </div>

      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowUserDetails(false)}
            style={{ animation: "fadeIn 0.25s ease-out" }}
          />

          <div
            className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
            style={{ animation: "slideInRight 0.3s ease-out" }}
          >
            <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 p-6 pb-20 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-lg">User Details</h3>
                <button
                  id="close-details-btn"
                  onClick={() => setShowUserDetails(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex justify-center -mt-14 relative z-10 mb-4">
              <div className="relative">
                <img
                  src={
                    (userDetails?.profilePic || conversationUser?.profilePic) ||
                    "https://i.pravatar.cc/120"
                  }
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                  alt="User avatar"
                />
                <span
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white ${isOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                />
              </div>
            </div>

            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading details...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 px-6 pb-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {userDetails?.username || conversationUser?.username}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium ${isOnline
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-400"}`} />
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="space-y-3">
                  {userDetails?.email && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Mail size={18} className="text-teal-600" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                        <p className="text-sm text-gray-700 truncate">{userDetails.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-blue-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-gray-700 truncate">
                        {userDetails?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {userDetails?.createdAt && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Calendar size={18} className="text-purple-600" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Joined</p>
                        <p className="text-sm text-gray-700">
                          {new Date(userDetails.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Shield size={18} className="text-amber-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Messages</p>
                      <p className="text-sm text-gray-700">{messages.length} in this conversation</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="mt-8 w-full py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash size={16} />
                  Delete This Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deletingChat && setShowDeleteConfirm(false)}
            style={{ animation: "fadeIn 0.2s ease-out" }}
          />

          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
            style={{ animation: "scaleIn 0.25s ease-out" }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Trash size={24} className="text-red-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              Delete Conversation?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                id="cancel-delete-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingChat}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleDeleteChat}
                disabled={deletingChat}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingChat ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes menuSlideIn {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
};

export default ChatPanel;