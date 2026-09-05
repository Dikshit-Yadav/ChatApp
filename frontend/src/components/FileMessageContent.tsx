import React, { useState } from "react";
import { Download, FileText, Music, File, Eye, X } from "lucide-react";
import type { Message, MessageFile } from "../types/type";

interface FileMessageContentProps {
  msg: Message;
  isMe: boolean;
}

export const getFullFileUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4500";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const FileMessageContent: React.FC<FileMessageContentProps> = ({ msg, isMe }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  let attachmentList: MessageFile[] = [];
  if (msg.files && msg.files.length > 0) {
    attachmentList = msg.files;
  } else if (msg.file && msg.file.url) {
    attachmentList = [msg.file];
  }

  if (attachmentList.length === 0 && !msg.message) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2 rounded-full bg-gray-800/50"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={selectedImage}
              download
              target="_blank"
              rel="noreferrer"
              className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={16} /> Download Full Image
            </a>
          </div>
        </div>
      )}

      {attachmentList.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachmentList.filter((f) => f.type === "image").length > 0 && (
            <div
              className={`grid gap-1.5 rounded-xl overflow-hidden ${attachmentList.filter((f) => f.type === "image").length === 1
                ? "grid-cols-1"
                : attachmentList.filter((f) => f.type === "image").length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3"
                }`}
            >
              {attachmentList
                .filter((f) => f.type === "image")
                .map((file, idx) => {
                  const fullUrl = getFullFileUrl(file.url);
                  return (
                    <div
                      key={idx}
                      className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 aspect-square max-h-[220px]"
                      onClick={() => setSelectedImage(fullUrl)}
                    >
                      <img
                        src={fullUrl}
                        alt={file.name || "Attachment"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye size={22} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {attachmentList
            .filter((f) => f.type === "video")
            .map((file, idx) => {
              const fullUrl = getFullFileUrl(file.url);
              return (
                <div key={idx} className="rounded-xl overflow-hidden bg-black/10">
                  <video
                    src={fullUrl}
                    controls
                    className="w-full max-h-[280px] rounded-xl object-contain bg-black"
                  />
                  {file.name && (
                    <div className="px-2 py-1 text-[11px] truncate opacity-75">
                      {file.name} ({formatFileSize(file.size)})
                    </div>
                  )}
                </div>
              );
            })}

          {attachmentList
            .filter((f) => f.type === "audio")
            .map((file, idx) => {
              const fullUrl = getFullFileUrl(file.url);
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${isMe
                    ? "bg-teal-600/20 border-teal-400/30 text-white"
                    : "bg-gray-100 border-gray-200 text-gray-800"
                    }`}
                >
                  <div className="flex items-center gap-2 text-xs font-medium truncate">
                    <Music size={16} className="text-teal-400 flex-shrink-0" />
                    <span className="truncate">{file.name || "Audio file"}</span>
                    <span className="text-[10px] opacity-75 ml-auto flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <audio src={fullUrl} controls className="w-full h-8 max-w-[280px]" />
                </div>
              );
            })}

          {attachmentList
            .filter((f) => f.type === "document" || f.type === "other" || !f.type)
            .map((file, idx) => {
              const fullUrl = getFullFileUrl(file.url);
              const isDoc = file.type === "document";
              return (
                <a
                  key={idx}
                  href={fullUrl}
                  download={file.name || "download"}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 group ${isMe
                    ? "bg-teal-600/30 border-teal-400/40 text-white hover:bg-teal-600/40"
                    : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDoc ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"
                        }`}
                    >
                      {isDoc ? <FileText size={20} /> : <File size={20} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold truncate max-w-[180px] sm:max-w-[220px]">
                        {file.name || "File Document"}
                      </p>
                      <p className={`text-[10px] ${isMe ? "text-teal-100" : "text-gray-400"}`}>
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${isMe ? "bg-white/20 text-white" : "bg-teal-500 text-white"
                      }`}
                  >
                    <Download size={14} />
                  </div>
                </a>
              );
            })}
        </div>
      )}

      {msg.message && (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {msg.message}
        </div>
      )}
    </div>
  );
};
