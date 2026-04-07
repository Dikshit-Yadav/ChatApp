import React, { useEffect, useState } from "react";
import { getFriends } from "../services/userAPI";
import { useNavigate } from "react-router-dom";
import { conversationApi } from "../services/conversationAPI";

interface Friend {
  _id: string;
  username: string;
  profilePic?: string;
  unread?: number;
}

const RightPanel = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const loggedInUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await getFriends();
        setFriends(
          res.data.map((f: Friend) => ({
            ...f,
          }))
        );
      } catch (err) {
        console.error("Error fetching friends", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendClick = async (friendId: string) => {
    try {
      // Fetch or create private chat
      const conversation = await conversationApi.createPrivateConversation(loggedInUserId, friendId);

      if (conversation.data._id) {
        navigate(`/chat/messages/${conversation.data._id}`); // include /chat prefix if ChatPage route is /chat
      }
    } catch (err) {
      console.error("Error opening conversation:", err);
    }
  };

  const displayedFriends = showUnreadOnly
    ? friends.filter(f => (f.unread || 0) > 0)
    : friends;

  return (
    <div className="w-[350px] flex-shrink-0 h-screen bg-[#eaf3f5] flex flex-col border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-700">Chats</h2>
      </div>

      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 rounded-full text-sm outline-none border border-gray-300 focus:ring-2 focus:ring-teal-300"
        />
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
        <button
          className={`flex-1 text-sm font-medium pb-1 text-center rounded-md ${activeTab === "direct"
            ? "text-teal-600 border-b-2 border-teal-600"
            : "text-gray-500 hover:text-teal-600 transition-colors"
            }`}
          onClick={() => setActiveTab("direct")}
        >
          Direct
        </button>

        <button
          className={`flex-1 text-sm font-medium pb-1 text-center rounded-md ${activeTab === "groups"
            ? "text-teal-600 border-b-2 border-teal-600"
            : "text-gray-500 hover:text-teal-600 transition-colors"
            }`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
        </button>

        <button
          className={`ml-auto bg-teal-600 text-white text-xs px-3 py-1 rounded-full hover:bg-teal-700 transition`}
          onClick={() => setShowUnreadOnly(prev => !prev)}
        >
          {showUnreadOnly ? "All Chats" : "Unread"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Loading...</p>
        ) : displayedFriends.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            {showUnreadOnly ? "No unread chats" : "No friends yet"}
          </p>
        ) : (
          displayedFriends.map(friend => (
            <div
              key={friend._id}
              onClick={() => handleFriendClick(friend._id)}
              className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/70 transition shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={friend.profilePic || "https://i.pravatar.cc/40"}
                  className="w-12 h-12 rounded-full hover:ring-2 hover:ring-teal-400 transition-all"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-700 truncate">{friend.username}</p>
                  <p className="text-xs text-gray-400 truncate">Start conversation...</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RightPanel;