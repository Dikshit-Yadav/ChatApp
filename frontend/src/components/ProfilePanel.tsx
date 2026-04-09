import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/profileStore";

const ProfilePage = ({ userId }: { userId: string }) => {
  const { profile, fetchProfile, updateUserProfile, loading } =
    useProfileStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile(userId);
  }, [userId]);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    if (file) data.append("profilePic", file);

    await updateUserProfile(userId, data);
    setEditing(false);
  };

  if (!profile || loading)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-6 rounded-2xl text-white flex items-center gap-4">
          <img
            src={profile.profilePic || "https://i.pravatar.cc/40"}
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-xl font-semibold">
              {profile.username}
            </h2>
            <p className="text-sm text-slate-300">
              {profile.email}
            </p>
          </div>
        </div>

        {/* card */}
        <div className="bg-white rounded-2xl p-6 shadow space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              Profile Info
            </h3>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg"
              >
                Save
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm">

            {/* username */}
            <div>
              <p className="text-gray-400">Username</p>
              {editing ? (
                <input
                  name="username"
                  value={form.username || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              ) : (
                <p>{profile.username}</p>
              )}
            </div>

            {/* email */}
            <div>
              <p className="text-gray-400">Email</p>
              {editing ? (
                <input
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              ) : (
                <p>{profile.email}</p>
              )}
            </div>

            {/* phone */}
            <div>
              <p className="text-gray-400">Phone</p>
              {editing ? (
                <input
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              ) : (
                <p>{profile.phone || "Not provided"}</p>
              )}
            </div>

            {/* profile Pic */}
            {editing && (
              <div>
                <p className="text-gray-400">
                  Profile Picture
                </p>
                <input type="file" onChange={handleFileChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;