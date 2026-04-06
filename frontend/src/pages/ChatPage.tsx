import Sidebar from "../components/Sidebar";
import AddFriend from "./AddFriend";
import RightPanel from "../components/RightPanel";
import ChatPanel from "../components/ChatPanel";
import { Routes, Route } from "react-router-dom";

export default function ChatPage() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Middle panel with routes */}
      <div className="flex flex-col w-[350px] border-r border-gray-200 overflow-hidden">
        <Routes>
          <Route path="/add-friend" element={<AddFriend />} />
        </Routes>
        <RightPanel />
      </div>

      {/* Chat Panel */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/messages/:conversationId" element={<ChatPanel />} />
          {/* Optional default placeholder */}
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