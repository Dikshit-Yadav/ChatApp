import { useState, useEffect } from "react";
import { useFriendStore } from "../store/friendStore";

export default function AddFriend() {
    const [search, setSearch] = useState("");
    const {
        searchResults,
        requests,
        suggestions,
        loading,
        fetchRequests,
        fetchSuggestions,
        handleSearch,
        sendInvite,
        respondInvite,
    } = useFriendStore();

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = typeof loggedInUser === "string" ? loggedInUser : loggedInUser?._id;

    // initial fetch
    useEffect(() => {
        fetchSuggestions();
        fetchRequests();
    }, []);

    // debounce search
    useEffect(() => {
        const delay = setTimeout(() => handleSearch(search), 400);
        return () => clearTimeout(delay);
    }, [search]);

    return (
        <div className="flex">
            <div className="flex-1 bg-gradient-to-br from-teal-100 to-slate-200 p-6 min-h-screen">
                <h1 className="text-2xl font-bold text-gray-700 mb-1">Expand your circle.</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Search by username, phone, or email to find your people.
                </p>

                {requests.length > 0 && (
                    <>
                        <h3 className="text-gray-700 font-semibold mb-3">Friend Requests</h3>
                        <div className="flex gap-4 mb-6 flex-wrap">
                            {requests.map((req) => (
                                <div key={req._id} className="bg-white p-3 rounded-xl shadow flex items-center justify-between w-[350px]">
                                    <div className="flex items-center gap-3">
                                        <img src={req.senderId.profilePic || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium">{req.senderId.username}</p>
                                            <p className="text-xs text-gray-500">{req.senderId.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => respondInvite(req._id, "accepted")} className="bg-teal-600 text-white px-2 py-1 rounded">✔</button>
                                        <button onClick={() => respondInvite(req._id, "rejected")} className="bg-gray-300 px-2 py-1 rounded">✖</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* search */}
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
                    {searchResults.map((user) => (
                        <div key={user._id} className="bg-white p-4 rounded-2xl shadow w-[200px] text-center">
                            <img src={user.profilePic || "https://i.pravatar.cc/80"} className="w-16 h-16 rounded-full mx-auto mb-3" />
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500 mb-3">{user.email}</p>

                            {user.friends?.includes(currentUserId) ? (
                                <button className="w-full bg-gray-400 text-white py-1 rounded-lg">Friends</button>
                            ) : user.invitationStatus === "pending" ? (
                                <button className="w-full bg-yellow-500 text-white py-1 rounded-lg">Pending</button>
                            ) : (
                                <button onClick={() => sendInvite(user._id)} className="w-full bg-teal-600 text-white py-1 rounded-lg">+ Add</button>
                            )}
                        </div>
                    ))}
                </div>

                {suggestions.length > 0 && (
                    <>
                        <h3 className="text-gray-700 font-semibold mb-3">People You May Know</h3>
                        <div className="flex gap-4 mb-6 flex-wrap">
                            {suggestions
                            .filter(user => user.invitationStatus !== "pending").map((user) => (
                                <div key={user._id} className="bg-white p-3 rounded-xl shadow flex items-center justify-between w-[380px]">
                                    <div className="flex items-center gap-3">
                                        <img src={user.profilePic || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium">{user.username}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    {user.friends?.includes(currentUserId) ? (
                                        <button className="w-full bg-gray-400 text-white py-1 rounded-lg">Friends</button>
                                    ) : user.invitationStatus === "pending" ? (
                                        <button className="w-full bg-yellow-500 text-white py-1 rounded-lg">Pending</button>
                                    ) : (
                                        <button onClick={() => sendInvite(user._id)} className="bg-teal-600 text-white py-1 px-3 text-sm rounded-lg">+ Add</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}