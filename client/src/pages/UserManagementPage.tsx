import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAccounts,
  deleteAccount,
  updateAccountStatus,
  adminResetPassword,
} from "../lib/account.service";
import { useAuth } from "../lib/authContext";

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resetModalUser, setResetModalUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [actionModalUser, setActionModalUser] = useState<any>(null);
  const [actionType, setActionType] = useState<
    "delete" | "activate" | "deactivate" | "reset"
  >("delete");
  const [adminPassword, setAdminPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = { page: page.toString(), limit: "10" };
      if (search) params.search = search;
      if (phone) params.phone = phone;
      if (status && status !== "All") params.status = status.toLowerCase();

      const res = await getAccounts(params);
      setUsers(res.data.data);
      setTotalPages(Math.ceil(res.data.total / res.data.limit) || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setSearch("");
    setPhone("");
    setStatus("All");
    setPage(1);
    setTimeout(fetchUsers, 0);
  };

  return (
    <div className="bg-white p-6 shadow-sm rounded-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">User List</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex gap-5 mb-6 flex-wrap items-center text-sm">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 p-2.5 rounded-md focus:outline-blue-500 min-w-30 appearance-none bg-white pr-8 text-gray-700 shadow-sm"
          >
            <option value="All">All</option>
            <option value="deactivated">Deactivated</option>
            <option value="active">Activated</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter User Name / Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-md w-64 focus:outline-blue-500 text-gray-700 placeholder-gray-400 shadow-sm"
        />
        <input
          type="text"
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-md w-48 focus:outline-blue-500 text-gray-700 placeholder-gray-400 shadow-sm"
        />

        <div className="flex-1"></div>

        <button
          onClick={handleSearch}
          className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition shadow-sm font-medium ml-2"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition shadow-sm font-medium ml-2"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500 text-sm">
          Loading data...
        </p>
      ) : (
        <div className="overflow-x-auto text-sm border-t border-b border-gray-200">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3 font-medium">User Name</th>
                <th className="p-3 font-medium">User Type</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Mobile Number</th>
                <th className="p-3 font-medium">Associated Roles</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Operation</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-gray-700"
                >
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">Local User</td>
                  <td className="p-3">
                    <Link
                      to={`/users/${u.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {u.email}
                    </Link>
                  </td>
                  <td className="p-3">{u.phone || ".........."}</td>
                  <td
                    className="p-3 truncate max-w-37.5"
                    title={
                      u.is_admin
                        ? "Administrator, Default User"
                        : "Default User"
                    }
                  >
                    {u.is_admin
                      ? "Administrator, Default User"
                      : "Default User"}
                  </td>
                  <td className="p-3">
                    {u.status === "activated" ? "Activated" : "Deactivated"}
                  </td>
                  <td className="p-3 text-right space-x-3">
                    {u.id !== currentUser?.id && (
                      <>
                        {(u.status === "activated" ||
                          u.status === "active") && (
                          <button
                            onClick={() => setResetModalUser(u)}
                            className="text-blue-500 hover:underline"
                          >
                            Reset Password
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActionType("delete");
                            setActionModalUser(u);
                          }}
                          disabled={
                            u.status === "activated" || u.status === "active"
                          }
                          className={`hover:underline ${u.status === "activated" || u.status === "active" ? "text-gray-400 cursor-not-allowed hover:no-underline" : "text-blue-500"}`}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setActionType(
                              u.status === "activated" || u.status === "active"
                                ? "deactivate"
                                : "activate",
                            );
                            setActionModalUser(u);
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          {u.status === "activated" || u.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="p-8 text-center text-gray-500 text-sm">
              No users found.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4 text-sm items-center text-gray-600">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          &lt;
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {/* Reset Password Step 1 Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              Reset Password for {resetModalUser.username}
            </h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setResetModalUser(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const passwordRegex =
                    /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,19}$/;
                  if (!passwordRegex.test(newPassword)) {
                    return alert(
                      "Password must be 8-20 characters long, start with a capital letter, and contain at least one number and one special character.",
                    );
                  }
                  if (!newPassword || newPassword !== confirmPassword)
                    return alert("Passwords do not match");
                  setResetModalUser(null);
                  setActionType("reset");
                  setActionModalUser(resetModalUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Confirm Modal */}
      {actionModalUser && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4 capitalize">
              Confirm {actionType}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your admin password to {actionType} the account for{" "}
              <b>{actionModalUser.username}</b>.
            </p>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setActionModalUser(null);
                  setAdminPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !adminPassword}
                onClick={async () => {
                  try {
                    setActionLoading(true);
                    if (actionType === "delete") {
                      await deleteAccount(actionModalUser.id, {
                        password: adminPassword,
                      });
                    } else if (
                      actionType === "activate" ||
                      actionType === "deactivate"
                    ) {
                      await updateAccountStatus(actionModalUser.id, {
                        status:
                          actionType === "activate"
                            ? "activated"
                            : "deactivated",
                        password: adminPassword,
                      });
                    } else if (actionType === "reset") {
                      await adminResetPassword(actionModalUser.id, {
                        new_password: newPassword,
                        password: adminPassword,
                      });
                    }
                    alert("Operation successful");
                    setActionModalUser(null);
                    setAdminPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    fetchUsers();
                  } catch (e: any) {
                    alert(e.response?.data?.error || e.message);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
