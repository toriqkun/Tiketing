import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../lib/ticket.service";

export default function TicketQueryPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [ticketId, setTicketId] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [status, setStatus] = useState("");
  const [phase, setPhase] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params: any = { page: page.toString(), limit: "10" };
      if (ticketId) params.ticket_number = ticketId;
      if (ticketType) params.ticket_type = ticketType;
      if (status) params.status = status;
      if (phase) params.current_phase = phase;

      const res = await getTickets(params);
      setTickets(res.data.tickets);
      setTotalPages(Math.ceil(res.data.total / res.data.limit) || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchTickets();
  };

  const handleReset = () => {
    setTicketId("");
    setTicketType("");
    setStatus("");
    setPhase("");
    setPage(1);
    setTimeout(fetchTickets, 0);
  };

  return (
    <div className="bg-white p-6 shadow-sm rounded-md">
      {/* Top Bar matching mockup */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tickets</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-5 mb-6 flex-wrap items-center text-sm">
        <input
          type="text"
          placeholder="Enter Ticket ID"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-md w-65 focus:outline-blue-500 text-gray-700 placeholder-gray-400 shadow-sm"
        />

        <select
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-md focus:outline-blue-500 min-w-[140px] appearance-none bg-white pr-8 text-gray-700 relative shadow-sm"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
        >
          <option value="">All Types</option>
          <option value="create">Create</option>
          <option value="extend">Extend</option>
          <option value="upgrade">Upgrade</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-md focus:outline-blue-500 min-w-[120px] appearance-none bg-white pr-8 text-gray-700 relative shadow-sm"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
        >
          <option value="">All Statuses</option>
          <option value="running">Running</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-md focus:outline-blue-500 min-w-[120px] appearance-none bg-white pr-8 text-gray-700 relative shadow-sm"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
        >
          <option value="">All Phases</option>
          <option value="submission">Submit Ticket</option>
          <option value="approval">Approval L1</option>
          <option value="provisioning">Provisioning</option>
          <option value="verification">Verification</option>
        </select>

        <div className="flex-1"></div> {/* Spacer */}

        <button
          onClick={handleSearch}
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md bg-white hover:bg-gray-50 transition font-medium shadow-sm"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md bg-white hover:bg-gray-50 transition font-medium shadow-sm ml-2"
        >
          Reset
        </button>
        <Link
          to="/tickets/new"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm ml-2"
        >
          + Create
        </Link>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500 text-sm">Loading tickets...</p>
      ) : (
        <div className="overflow-x-auto text-sm border-t border-b border-gray-200">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3 font-medium">Ticket ID</th>
                <th className="p-3 font-medium">Ticket Status</th>
                <th className="p-3 font-medium">Ticket Type</th>
                <th className="p-3 font-medium">Phase</th>
                <th className="p-3 font-medium">Ticket Creator</th>
                <th className="p-3 font-medium">Created Time</th>
                <th className="p-3 font-medium">Update Time</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((t: any) => {
                  return (
                    <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-gray-700">
                      <td className="p-3">
                        <Link
                          to={`/tickets/${t.id}`}
                          className="text-blue-500 hover:underline"
                        >
                          {t.ticket_number}
                        </Link>
                      </td>
                      <td className="p-3">
                        {t.status === "running" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Running
                          </span>
                        ) : (
                          <span className="text-gray-500">Closed</span>
                        )}
                      </td>
                      <td className="p-3 capitalize">{t.ticket_type.replace('_', ' ')}</td>
                      <td className="p-3 capitalize">{t.current_phase}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 border rounded-full px-2 py-0.5 border-gray-300 bg-white">
                          👤 {t.requester?.username || "Unknown"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="p-3 text-gray-600">{new Date(t.updated_at).toLocaleString()}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
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
    </div>
  );
}
