import { useState, useEffect } from "react";
import { getAccountById } from "../lib/account.service";
import { useAuth } from "../lib/authContext";

export default function ProfilePage() {
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

  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      if (!currentUser?.id) return;
      const { data } = await getAccountById(currentUser.id);
      setUser(data);
      setEditData({
        username: data.username,
        email: data.email,
        phone: data.phone || "",
        is_admin: data.is_admin,
        expired_time: data.expired_time ? new Date(data.expired_time).toISOString().slice(0, 16) : "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !user) return <div className="p-8 text-red-500 text-center">{error || "Profile not found"}</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-800">
        <h2>Profile Detail</h2>
      </div>

      <div className="bg-white shadow-sm border rounded-md">
        <div className="flex border-b px-6">
          <div className="py-3 px-2 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">
            Basic Information
          </div>
        </div>

        <div className="p-8 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

            {/* Username */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                <span className="text-red-500 mr-1">*</span>User Name
              </label>
              <input
                type="text"
                value={editData.username}
                disabled
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 text-sm focus:outline-none"
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
                disabled
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
                disabled
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 text-sm focus:outline-none"
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
                  disabled
                  className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 text-sm focus:outline-none pl-8"
                />
                <span className="absolute left-2 top-2 text-gray-400">🕒</span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="md:col-span-2 mt-4 flex gap-4">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition"
                onClick={() => setChangePasswordModal(true)}
              >
                Change Password
              </button>
            </div>

          </div>
        </div>
      </div>

      {changePasswordModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Old Password</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full border p-2 rounded text-sm" />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border p-2 rounded text-sm" />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border p-2 rounded text-sm" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setChangePasswordModal(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button
                disabled={passwordLoading}
                onClick={async () => {
                  if (!oldPassword || !newPassword || !confirmPassword) return alert("All fields are required");
                  if (newPassword !== confirmPassword) return alert("New passwords do not match");
                  const passwordRegex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,19}$/;
                  if (!passwordRegex.test(newPassword)) {
                    return alert("Password must be 8-20 characters long, start with a capital letter, and contain at least one number and one special character.");
                  }
                  try {
                    setPasswordLoading(true);
                    // Use apiClient directly
                    const { apiClient } = await import("../lib/apiClient");
                    await apiClient("/auth/reset-password", {
                      method: "POST",
                      body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
                    });
                    alert("Password updated successfully");
                    setChangePasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (e: any) {
                    alert(e.response?.data?.error || e.message);
                  } finally {
                    setPasswordLoading(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordLoading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
