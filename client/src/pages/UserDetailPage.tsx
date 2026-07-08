import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { getAccountById, updateAccount } from "../lib/account.service";
import { useAuth } from "../lib/authContext";

export default function UserDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editData, setEditData] = useState({
    username: "",
    email: "",
    phone: "",
    is_admin: false,
    expired_time: "",
  });

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await getAccountById(id as string);
      setUser(data);
      setEditData({
        username: data.username,
        email: data.email,
        phone: data.phone || "",
        is_admin: data.is_admin,
        expired_time: data.expired_time ? new Date(data.expired_time).toISOString().slice(0, 16) : "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateAccount(id as string, editData);
      alert("User updated successfully");
      fetchUser();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !user) return <div className="p-8 text-red-500">{error || "User not found"}</div>;

  const isAdmin = currentUser?.is_admin;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-800">
        <Link to="/users" className="text-blue-600 hover:underline">
          &larr;
        </Link>
        <h2>Current User: {user.username}</h2>
      </div>

      <div className="bg-white shadow-sm border rounded-md">
        <div className="flex border-b px-6">
          <div className="py-3 px-2 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">
            Basic Information
          </div>
        </div>

        <div className="p-8 bg-gray-50/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">


            {/* Username */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                <span className="text-red-500 mr-1">*</span>User Name
              </label>
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                disabled={!isAdmin}
                className={`w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 ${!isAdmin && "bg-gray-50"}`}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                <span className="text-red-500 mr-1">*</span>Email
              </label>
              <input
                type="email"
                value={editData.email}
                disabled // API doesn't allow changing email here according to backend
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 text-sm focus:outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                <span className="text-red-500 mr-1">*</span>Mobile Number
              </label>
              <input
                type="text"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                disabled={!isAdmin}
                className={`w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 ${!isAdmin && "bg-gray-50"}`}
              />
            </div>

            {/* Effective Time */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                <span className="text-red-500 mr-1">*</span>Effective Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={new Date(user.effective_time).toLocaleString()}
                  disabled
                  className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 text-sm focus:outline-none pl-8"
                />
                <span className="absolute left-2 top-2 text-gray-400">🕒</span>
              </div>
            </div>

            {/* Expiration Time */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Expiration Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={editData.expired_time}
                  onChange={(e) => setEditData({ ...editData, expired_time: e.target.value })}
                  disabled={!isAdmin}
                  className={`w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 pl-8 ${!isAdmin && "bg-gray-50"}`}
                />
                <span className="absolute left-2 top-2 text-gray-400">🕒</span>
              </div>
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                <span className="text-red-500 mr-1">*</span>Associated Roles
              </label>
              <div className="border border-gray-300 rounded p-4 bg-gray-50 flex flex-col gap-3">
                <div className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded">
                   <span className="text-sm font-medium text-gray-700">Default User</span>
                </div>
                {editData.is_admin && (
                  <div className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded">
                     <span className="text-sm font-medium text-gray-700">Administrator</span>
                     {isAdmin && (
                       <button type="button" onClick={() => setEditData({...editData, is_admin: false})} className="text-red-500 text-xs hover:underline">Remove</button>
                     )}
                  </div>
                )}
                {isAdmin && !editData.is_admin && (
                  <div className="flex items-center gap-2 mt-2">
                     <button type="button" onClick={() => setEditData({...editData, is_admin: true})} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-200 text-xs font-medium hover:bg-blue-100 transition shadow-sm">+ Add Administrator Role</button>
                  </div>
                )}
              </div>
            </div>

            {/* Status (Readonly indicator, status changed via actions in management) */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <input
                type="text"
                value={user.status === "activated" || user.status === "active" ? "Activated" : "Deactivated"}
                disabled
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 text-sm focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              {isAdmin && (
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
