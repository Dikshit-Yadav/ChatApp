import { MessageCircle, UserPlus, Settings, Users, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInvitations } from "../services/invitationAPI";
import { socket } from "../contex/socket.ts";
import toast from "react-hot-toast";

export default function Sidebar() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const profilePic = userData.profilePic;
  const navigate = useNavigate();
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    socket.on("new-invite", () => {
      fetchInvites();
      toast.success("New invite received!");
    });
    return () => {
      socket.off("new-invite");
    };
  }, []);

  useEffect(() => {
    socket.on("invite-response", (data) => {
      toast.success(`User ${data.receiverId} ${data.status} your request!`);
      fetchInvites();
    });
    return () => {
      socket.off("invite-response");
    };
  }, []);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await getInvitations();
      setRequestCount(res.data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-[80px] h-screen bg-[#E6F2F7] shadow-lg flex flex-col justify-between p-4">
      <div className="flex flex-col items-center space-y-6 mt-2">

        <button
          onClick={() => navigate("/chat")}
          className="p-2 rounded-lg hover:bg-teal-200 text-teal-700 transition-colors"
          aria-label="Messages"
        >
          <MessageCircle size={26} />
        </button>

        <button
          onClick={() => navigate("/groups")}
          className="p-2 rounded-lg hover:bg-teal-200 text-teal-700 transition-colors"
          aria-label="Groups"
        >
          <Users size={26} />
        </button>

        <button
          onClick={() => {
            setRequestCount(0);
            navigate("/add-friend");
          }}
          className="relative p-2 rounded-lg hover:bg-teal-200 text-teal-700 transition-colors"
          aria-label="Add Friend"
        >
          <UserPlus size={26} />
          {requestCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
              {requestCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center space-y-6 mb-2">
        <img
          src={profilePic || "https://i.pravatar.cc/40"}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-teal-400"
          onClick={() => navigate("/profile")}
        />
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-teal-200 text-teal-700 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={26} />
        </button>
      </div>
    </div>
  );
}