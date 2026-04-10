import { useEffect, useState } from "react";
import { getMe } from "../services/userAPI.ts";
import Sidebar from "../components/Sidebar";
import AddFriend from "./AddFriend";
import RightPanel from "../components/RightPanel";
import ChatPanel from "../components/ChatPanel";
import { Routes, Route } from "react-router-dom";
import { socket } from "../contex/socket";
import ProfilePage from "../components/ProfilePanel";

import GroupSidebar from "../components/GroupSidebar";
import GroupChat from "../components/GroupChat";
import CreateGroupModal from "../components/CreateGroupModel";
import InviteModal from "../components/AddMemberModel.tsx";

export default function ChatPage() {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    async function initUser() {
      let storedUser = localStorage.getItem("user");

      if (!storedUser) {
        try {
          const res = await getMe();
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          console.error(err);
        }
      }
    }
    initUser();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && !socket.connected) {
      socket.connect();
    }
  }, []);

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <Routes>

        <Route
          path="/*"
          element={
            <>
              {/* left panel */}
              <div className="flex flex-col w-[350px] border-r border-gray-200 overflow-hidden">
                <Routes>
                  <Route path="*" element={<RightPanel />} />
                </Routes>
              </div>

              {/* right panel */}
              <div className="flex-1 overflow-hidden">
                <Routes>
                  <Route path="add-friend" element={<AddFriend />} />
                  <Route path="messages/:conversationId" element={<ChatPanel />} />
                  <Route
                    path="profile"
                    element={
                      <ProfilePage
                        userId={
                          JSON.parse(localStorage.getItem("user") || "{}")._id
                        }
                      />
                    }
                  />
                </Routes>
              </div>
            </>
          }
        />

        <Route
          path="/groups"
          element={
            <>
              {/* group sidebar */}
              <GroupSidebar
                onSelect={setSelectedGroup}
                onCreate={() => setShowCreate(true)}
              />

              {/* group chat */}
              <GroupChat
                group={selectedGroup}
                onInvite={() => setShowInvite(true)}
              />

              {/* model */}
              {showCreate && (
                <CreateGroupModal onClose={() => setShowCreate(false)} />
              )}

              {showInvite && selectedGroup && (
                <InviteModal
                  group={selectedGroup}
                  onClose={() => setShowInvite(false)}
                />
              )}
            </>
          }
        />
      </Routes>
    </div>
  );
}