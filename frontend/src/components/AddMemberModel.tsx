import { useEffect, useState } from "react";
import { conversationApi } from "../services/conversationAPI";
import { getFriends } from "../services/userAPI";

export default function AddMemberModal({ group, onClose, setGroups, setSelectedGroup }: any) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await getFriends();
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error(err);
    }
  };

  // check user in group
  const isMember = (userId: string) => {
    return group.members?.some((m: any) => m._id === userId);
  };

  // add member
  const addMember = async (userId: string) => {
    try {
      const res = await conversationApi.addMember(group._id, userId);

      const updatedGroup = res.data.group;

      setSelectedGroup(updatedGroup);

      setGroups((prev: any) =>
        prev.map((g: any) =>
          g._id === updatedGroup._id ? updatedGroup : g
        )
      );

    } catch (err) {
      console.error("Failed to add member", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-5 rounded-xl w-80 shadow-lg">

        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Add Members
        </h2>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {friends.map((f: any) => (
            <div
              key={f._id}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-100"
            >
              <span className="text-sm">{f.username}</span>

              <button
                disabled={isMember(f._id)}
                onClick={() => addMember(f._id)}
                className={`px-3 py-1 text-xs rounded transition ${
                  isMember(f._id)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-teal-500 text-white hover:bg-teal-600"
                }`}
              >
                {isMember(f._id) ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 hover:bg-gray-300 py-1.5 rounded text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}