import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../lib/ticket.service";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [ticketType, setTicketType] = useState("create");
  const [description, setDescription] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user changes type to 'create', they must enter someone else's details.
  // If extend/upgrade/inactive, it defaults to their own but can be changed.

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (ticketType === "create") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(targetEmail)) {
        setError("Invalid email format.");
        setLoading(false);
        return;
      }
    }

    try {
      await createTicket({
        ticket_type: ticketType,
        description,
        target_username: targetUsername,
        target_email: targetEmail,
        target_phone: targetPhone,
      });
      navigate("/tickets");
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data?.message;
      if (!backendError || backendError.includes("Target account is invalid or not registered")) {
        setError("Invalid user account, please enter a valid account username, email, and phone number");
      } else {
        setError(backendError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Ticket</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Ticket Type</label>
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="create">Create</option>
            <option value="extend">Extend</option>
            <option value="upgrade">Upgrade</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded h-24"
            placeholder="Explain the reason for this request..."
          />
        </div>

        <h3 className="text-lg font-medium mt-6 mb-2 border-b pb-2">
          Account Information
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Username
          </label>
          <input
            type="text"
            required
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Email</label>
          <input
            type="email"
            required
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Phone</label>
          <input
            type="text"
            required
            value={targetPhone}
            onChange={(e) => setTargetPhone(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4 disabled:bg-blue-300"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}
