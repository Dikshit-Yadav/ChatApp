import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { searchUsers, getSuggestions } from "../services/userAPI";
import { sendInvite, getInvitations, respondInvite } from "../services/invitationAPI";
import { socket } from "../contex/socket";
import toast from "react-hot-toast";

export default function AddFriend() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = typeof loggedInUser === "string" ? loggedInUser : loggedInUser?._id;


    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const res = await getSuggestions();
            setSuggestions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        socket.on("new-invite", (data) => {
            console.log("New request received", data);

            setRequests((prev) => [data.invite, ...prev]);

            toast(`${data.sender.username} sent you a request`);
        });

        return () => {
            socket.off("new-invite");
        };
    }, []);
    useEffect(() => {
        const delay = setTimeout(() => {
            handleSearch(search);
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await getInvitations();
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    const handleSendInvite = async (receiverId: string) => {
        try {
            await sendInvite(receiverId);

            setUsers((prev) =>
                prev.map((u) =>
                    u._id === receiverId
                        ? { ...u, invitationStatus: "pending" }
                        : u
                )
            );

        } catch (err: any) {
            console.error(err.response?.data?.message);
        }
    };
    const handleSearch = async (value: string) => {
        if (!value) {
            setUsers([]);
            return;
        }

        try {
            setLoading(true);

            const res = await searchUsers(value);
            setUsers(res.data);

        } catch (err: any) {
            console.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (invitationId: string, status: string) => {
        try {
            await respondInvite(invitationId, status);

            setRequests((prev) =>
                prev.filter((req) => req._id !== invitationId)
            );

        } catch (err: any) {
            console.error(err.response?.data?.message);
        }
    };
    return (
        <div className="flex">

            <Sidebar />

            <div className="flex-1 bg-gradient-to-br from-teal-100 to-slate-200 p-6 min-h-screen">
                <h1 className="text-2xl font-bold text-gray-700 mb-1">
                    Expand your circle.
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    Search by username, phone, or email to find your people.
                </p>
                {requests.length > 0 && (
                    <>
                        <h3 className="text-gray-700 font-semibold mb-3">
                            Friend Requests
                        </h3>

                        <div className="flex gap-4 mb-6 flex-wrap">
                            {requests.map((req) => (
                                <div
                                    key={req._id}
                                    className="bg-white p-3 rounded-xl shadow flex items-center justify-between w-[280px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={req.senderId.profilePic || "https://i.pravatar.cc/40"}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {req.senderId.username}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {req.senderId.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleResponse(req._id, "accepted")}
                                            className="bg-teal-600 text-white px-2 py-1 rounded"
                                        >
                                            ✔
                                        </button>

                                        <button
                                            onClick={() => handleResponse(req._id, "rejected")}
                                            className="bg-gray-300 px-2 py-1 rounded"
                                        >
                                            ✖
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="bg-white rounded-full px-4 py-2 flex items-center shadow mb-6">
                    <input
                        type="text"
                        placeholder="Search by username or phone"
                        className="flex-1 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading && <p>Searching...</p>}

                <div className="flex gap-6 flex-wrap">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white p-4 rounded-2xl shadow w-[200px] text-center"
                        >

                            <img
                                src={user.profilePic || "https://i.pravatar.cc/80"}
                                className="w-16 h-16 rounded-full mx-auto mb-3"
                            />

                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500 mb-3">{user.email}</p>

                            {user.friends?.includes(currentUserId) ? (
                                <button className="w-full bg-gray-400 text-white py-1 rounded-lg">
                                    Friends
                                </button>
                            ) : user.invitationStatus === "pending" ? (
                                <button className="w-full bg-yellow-500 text-white py-1 rounded-lg">
                                    Pending
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSendInvite(user._id)}
                                    className="w-full bg-teal-600 text-white py-1 rounded-lg"
                                >
                                    + Add
                                </button>
                            )}

                        </div>
                    ))}
                </div>

                {suggestions.length > 0 && (
                    <>
                        <h3 className="text-gray-700 font-semibold mb-3">
                            People You May Know
                        </h3>

                        <div className="flex gap-4 mb-6 flex-wrap">
                            {suggestions.map((user) => (
                                <div
                                    key={user._id}
                                    className="bg-white p-3 rounded-xl shadow flex items-center justify-between w-[280px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.profilePic || "https://i.pravatar.cc/40"}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSendInvite(user._id)}
                                        className="bg-teal-600 text-white px-3 py-1 rounded"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}