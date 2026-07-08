import { useState } from "react";


export default function ResetPasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    const passwordRegex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,19}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be 8-20 characters long, start with a capital letter, and contain at least one number and one special character.");
      return;
    }
    
    try {
      setPasswordLoading(true);
      const { apiClient } = await import("../lib/apiClient");
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
      });
      alert("Password updated successfully");
      window.location.href = "/";
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded shadow-sm border w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Change Password Required</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          You must change your password before you can continue using the application.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-6 rounded text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Old Password</label>
            <input 
              type="password" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
              className="w-full border p-2 rounded text-sm focus:outline-blue-500" 
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full border p-2 rounded text-sm focus:outline-blue-500" 
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full border p-2 rounded text-sm focus:outline-blue-500" 
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition disabled:opacity-50"
          >
            {passwordLoading ? "Processing..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
