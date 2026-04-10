import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import { conversationApi } from "../services/conversationAPI";
import { useNavigate } from "react-router-dom";


export default function GroupSidebar({ onSelect, onCreate, inviteCount }: any) {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("groups");

  const navigate = useNavigate();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await conversationApi.getConversations();
      const groupChats = res.data.conversations?.filter(
        (c: any) => c.isGroup
      ) || [];
      setGroups(groupChats);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const filteredGroups = groups.filter((group: any) =>
  group.groupName?.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="w-[350px] flex-shrink-0 h-screen bg-[#eaf3f5] flex flex-col border-l border-gray-200">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-teal-700 font-semibold">
          <Users size={22} />
          <span>Groups</span>
        </div>

        <button
          onClick={onCreate}
          className="relative p-2 rounded-lg hover:bg-teal-200 text-teal-700 transition"
        >
          <Plus size={20} />
          {inviteCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
              {inviteCount}
            </span>
          )}
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-full text-sm outline-none border border-gray-300 focus:ring-2 focus:ring-teal-300"
        />
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
        <button
          className={`flex-1 text-sm font-medium pb-1 text-center rounded-md ${activeTab === "direct"
            ? "text-teal-600 border-b-2 border-teal-600"
            : "text-gray-500 hover:text-teal-600 transition-colors"
            }`}
          onClick={() => {
            setActiveTab("direct")
            navigate("/chat")
          }}
        >
          Direct
        </button>
        <button
          className={`flex-1 text-sm font-medium pb-1 text-center rounded-md ${activeTab === "groups"
            ? "text-teal-600 border-b-2 border-teal-600"
            : "text-gray-500 hover:text-teal-600 transition-colors"
            }`}
          onClick={() => {
            setActiveTab("groups")
            navigate("/chat/groups")
          }}
        >
          Groups
        </button>
        <button
          className="ml-auto bg-teal-600 text-white text-xs px-3 py-1 rounded-full hover:bg-teal-700 transition"
          onClick={() => setShowUnreadOnly((prev) => !prev)}
        >
          {showUnreadOnly ? "All Chats" : "Unread"}
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-4">
            No groups yet
          </p>
        ) : (
          filteredGroups.map((group: any) => (
            <div
              key={group._id}
              onClick={() => onSelect(group)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-teal-100 transition"
            >
              <div className="w-9 h-9 bg-teal-400 text-white flex items-center justify-center rounded-full font-bold">
                {group.groupName?.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {group.groupName}
                </span>
                <span className="text-xs text-gray-500">
                  {group.members?.length || 0} members
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}