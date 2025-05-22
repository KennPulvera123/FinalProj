import React from "react";

import { useContext, useState } from "react";

import { UserContext } from "../UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../axios";
import PlacesPage from "./PlacesPage";
import AccountNav from "../AccountNav";

export default function ProfilePage() {
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
  const { subpage = "profile" } = useParams();

  // Profile edit states
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  async function handleLogout() {
    try {
      await api.post("/logout");
      setUser(null);
      setRedirect("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data || error.message);
    }
  }


  React.useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  async function handleProfileUpdate(ev) {
    ev.preventDefault();
    setProfileMsg("");

    try {
      const updateData = { name, email };
      if (newPassword) {
        updateData.password = newPassword;
        updateData.currentPassword = currentPassword;
      }
      const { data } = await api.put("/profile", updateData);
      setUser(data.user);
      setProfileMsg("✅ Profile updated!");
      setEditMode(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setProfileMsg(
        error.response?.data?.message || "❌ Failed to update profile."
      );
    }
  }

  if (!ready) {
    return <div className="text-center">Loading user data...</div>;
  }

  if (ready && !user && !redirect) {
    return <Navigate to="/login" />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <AccountNav />
      {subpage === "profile" && (
        <div className="max-w-lg mx-auto mt-6">
          {!editMode ? (
            <div className="text-center">
              <p>
                Logged in as <strong>{user?.name}</strong> ({user?.email})
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="primary max-w-sm mt-2 mr-2"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="primary max-w-sm mt-2"
              >
                Logout
              </button>
              {profileMsg && (
                <div className="mt-4 text-green-600 font-semibold">{profileMsg}</div>
              )}
            </div>
          ) : (
            <form
              className="bg-gray-100 rounded-2xl p-6 shadow max-w-md mx-auto"
              onSubmit={handleProfileUpdate}
            >
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <label className="block mb-1 font-semibold">Name:</label>
              <input
                type="text"
                value={name}
                onChange={ev => setName(ev.target.value)}
                className="w-full mb-3 p-2 rounded"
                required
              />
              <label className="block mb-1 font-semibold">Email:</label>
              <input
                type="email"
                value={email}
                onChange={ev => setEmail(ev.target.value)}
                className="w-full mb-3 p-2 rounded"
                required
              />
              <label className="block mb-1 font-semibold">Current Password (for password change):</label>
              <input
                type="password"
                value={currentPassword}
                onChange={ev => setCurrentPassword(ev.target.value)}
                className="w-full mb-3 p-2 rounded"
                autoComplete="current-password"
              />
              <label className="block mb-1 font-semibold">New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={ev => setNewPassword(ev.target.value)}
                className="w-full mb-3 p-2 rounded"
                autoComplete="new-password"
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="primary"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => {
                    setEditMode(false);
                    setProfileMsg("");
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                >
                  Cancel
                </button>
              </div>
              {profileMsg && (
                <div className="mt-2 text-red-600 font-semibold">{profileMsg}</div>
              )}
            </form>
          )}
        </div>
      )}
      {subpage === "places" && <PlacesPage />}
    </div>
  );
}
