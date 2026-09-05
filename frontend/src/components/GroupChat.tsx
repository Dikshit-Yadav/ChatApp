import { useEffect, useRef, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { useGroupChatStore } from "../store/groupChatStore";
import { useGroupChatSocket } from "../hooks/useGroupChatSocket";
import { Smile, Paperclip, Film, Music, FileText, X } from "lucide-react";
import { toast } from "react-toastify";
import type { Conversation, Message, User } from "../types/type";
import { FileMessageContent, formatFileSize } from "./FileMessageContent";

interface Props {
  group: Conversation | null;
  onInvite: () => void;
}

export default function GroupChat({ group, onInvite }: Props) {
  const {
    messages,
    members,
    loadingId,
    setGroup,
    fetchMessages,
    sendMessage,
    sendFileMessage,
    removeMember,
    deleteGroup,
    renameGroup,
    toggleReaction,
  } = useGroupChatStore();

  useGroupChatSocket();

  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(group?.groupName || "");
  const [activePicker, setActivePicker] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loggedInUser: User = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const adminId =
    typeof group?.admin === "object"
      ? group.admin._id
      : group?.admin;

  const isAdmin = adminId === loggedInUser._id;

  const isMe = (msg: Message): boolean => {
    const senderId =
      typeof msg.senderId === "object"
        ? msg.senderId._id
        : msg.senderId;

    return senderId === loggedInUser._id;
  };

  useEffect(() => {
    setGroup(group);
    if (group) {
      fetchMessages(group._id);
      setNewName(group.groupName || "");
    }
  }, [group]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSend = async () => {
    if ((!text.trim() && selectedFiles.length === 0) || uploading) return;

    const messageToSend = text;
    const filesToSend = [...selectedFiles];

    setText("");
    setSelectedFiles([]);

    if (filesToSend.length > 0) {
      setUploading(true);
      await sendFileMessage(filesToSend, messageToSend);
      setUploading(false);
      return;
    }

    sendMessage(messageToSend);
  };

  const handleRename = async () => {
    if (!group || !newName.trim() || newName === group.groupName) {
      setEditingName(false);
      return;
    }

    await renameGroup(group._id, newName);
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!group) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group?"
    );

    if (!confirmDelete) return;

    await deleteGroup(group._id);
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
            {editingName ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                className="font-semibold border-b border-teal-500 outline-none"
              />
            ) : (
              <h3
                onClick={() => setEditingName(true)}
                className="font-semibold cursor-pointer hover:text-teal-600"
              >
                {group.groupName}
              </h3>
            )}
            <span className="text-xs text-gray-400">Group chat</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(true)}
            className="bg-gray-200 p-2 rounded-full"
          >
            <FaUsers />
          </button>

          <button
            onClick={onInvite}
            className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm"
          >
            + Add
          </button>

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((m) => {
          const me = isMe(m);
          const sender = m.senderId;

          return (
            <div
              key={m._id}
              className={`flex flex-col ${me ? "items-end" : "items-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[70%]">
                {!me && (
                  <img
                    src={(sender as User)?.profilePic || "https://i.pravatar.cc/40"}
                    className="w-8 h-8 rounded-full"
                  />
                )}

                <div className="group relative">
                  {!me && (
                    <div className="text-xs text-gray-500">
                      {(sender as User)?.username}
                    </div>
                  )}

                  <div className="relative">
                    <div className={`px-4 py-2 rounded-xl text-sm ${me ? "bg-teal-500 text-white" : "bg-white text-gray-800"}`}>
                      <FileMessageContent msg={m} isMe={me} />
                    </div>

                    <button
                      onClick={() => setActivePicker(activePicker === m._id ? null : m._id)}
                      className={`absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md rounded-full p-1 text-gray-400 hover:text-teal-500 z-10 ${me ? "-left-8" : "-right-8"
                        }`}
                    >
                      <Smile size={16} />
                    </button>

                    {activePicker === m._id && (
                      <div className={`absolute -top-12 flex gap-2 bg-white shadow-xl p-2 rounded-full z-20 border border-gray-100 ${me ? "right-0" : "left-0"
                        }`}>
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              toggleReaction(m._id, emoji);
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

                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${me ? "justify-end" : "justify-start"}`}>
                      {Array.from(new Set(m.reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                        const count = m.reactions!.filter((r: any) => r.emoji === emoji).length;
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(m._id, emoji)}
                            className="bg-white px-1.5 py-0.5 rounded-full text-[10px] shadow-sm border border-gray-100 flex items-center gap-1 hover:bg-gray-50"
                          >
                            {emoji} <span>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

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

      <div className="p-3 bg-white flex items-center gap-2 shadow-md">
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

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder={
            selectedFiles.length > 0
              ? `Add a caption for ${selectedFiles.length} file(s)...`
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

      {showMembers && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[360px] max-h-[80vh] rounded-2xl p-5 overflow-y-auto">

            <h2 className="font-semibold text-lg mb-4">Group Members</h2>

            <div className="flex flex-col gap-4">
              {members.map((member, index) => {
                if (typeof member === "string") return null;
                const user = member as User;

                return (
                  <div key={user._id || index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "https://i.pravatar.cc/40"}
                        className="w-9 h-9 rounded-full"
                      />
                      <span>{user.username}</span>
                    </div>

                    {user._id !== loggedInUser._id && (
                      <button
                        disabled={loadingId === user._id}
                        onClick={() => removeMember(group._id, user._id)}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full"
                      >
                        {loadingId === user._id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowMembers(false)}
              className="mt-5 w-full bg-gray-200 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}