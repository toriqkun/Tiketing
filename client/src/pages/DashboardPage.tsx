import { useState, useEffect } from "react";
import { useAuth } from "../lib/authContext";
import { getDashboardSummary } from "../lib/dashboard.service";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await getDashboardSummary();
        setSummary(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}</h1>
      <p className="text-gray-600 mb-8">
        Here is the overview of your system today.
      </p>

      {user?.is_admin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Active Tickets
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.totalActiveTickets}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Total Accounts
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.totalAccounts}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Expiring Soon (&lt;30d)
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.accountsExpiringSoon}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Deactivated Accounts
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.deactivatedAccounts}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Total Tickets
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.totalTickets}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Active Tickets
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.activeTickets}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Rejected Tickets
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.rejectedTickets}
            </p>
          </div>
          <div className="bg-white p-6 shadow rounded-lg border-t-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              Days to Expiry
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.daysUntilExpiry}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
