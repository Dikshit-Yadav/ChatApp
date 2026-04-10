import { useState } from "react";
import { conversationApi } from "../services/conversationAPI";

export default function CreateGroupModal({ onClose }: any) {
  const [name, setName] = useState("");

  const createGroup = async () => {
    await conversationApi.createGroup(name, []);
    alert("Group Created");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[420px] bg-white rounded-2xl shadow-xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          Create New Group
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Define your collective sanctuary.
        </p>

        <label className="text-sm text-gray-600 font-medium">
          Group Name
        </label>
        <input
          className="w-full mt-1 mb-4 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Enter group name..."
          onChange={(e) => setName(e.target.value)}
        />


          <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={createGroup}
            className="flex-1 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}