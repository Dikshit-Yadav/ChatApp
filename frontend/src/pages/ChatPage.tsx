import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddFriend from "./AddFriend";
import RightPanel from "../components/RightPanel";
import ChatPanel from "../components/ChatPanel";
import { Routes, Route, useParams } from "react-router-dom";
import { socket } from "../contex/socket";

export default function ChatPage() {
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && !socket.connected) {
        socket.connect();
    }
}, []);
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex flex-col w-[350px] border-r border-gray-200 overflow-hidden">
        <Routes>
          <Route path="add-friend" element={<AddFriend />} />
          <Route path="*" element={<RightPanel />} />
        </Routes>
      </div>

      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="messages/:conversationId" element={<ChatPanel />} />

          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                Select a chat to start messaging
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}