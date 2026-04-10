import {useState } from "react";
import GroupSidebar from "../components/GroupSidebar";
import GroupChat from "../components/GroupChat";
import CreateGroupModal from "../components/CreateGroupModel";
import AddMemberModal from "../components/AddMemberModel";

export default function GroupPage() {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="flex h-screen">
      <GroupSidebar
        onSelect={setSelectedGroup}
        onCreate={() => setShowCreate(true)}
      />

      <GroupChat
        group={selectedGroup}
        onInvite={() => setShowInvite(true)}
      />

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} />
      )}

      {showInvite && selectedGroup && (
        <AddMemberModal
          group={selectedGroup}
          onClose={() => setShowInvite(false)}
          setGroups={setGroups}
          setSelectedGroup={setSelectedGroup}
        />
      )}
    </div>
  );
}