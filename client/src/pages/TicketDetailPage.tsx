import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTicketById } from "../lib/ticket.service";
import { API_BASE_URL } from "../lib/apiClient";
import TicketActionPanel from "../components/TicketActionPanel";

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await getTicketById(id!);
      setTicket(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;
  if (!ticket) return <div className="p-8 text-center">Ticket not found</div>;
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, '0') + "-" +
      String(d.getDate()).padStart(2, '0') + " " +
      String(d.getHours()).padStart(2, '0') + ":" +
      String(d.getMinutes()).padStart(2, '0') + ":" +
      String(d.getSeconds()).padStart(2, '0');
  };

  const hasInitialSubmit = ticket?.histories?.some((h: any) => h.phase === 'submit' && (h.action === 'submit' || h.action === 'Submit Ticket'));
  const allHistories = ticket ? [
    ...(hasInitialSubmit ? [] : [{
      id: "submit-0",
      action: "Submit Ticket",
      phase: "submission",
      actor: ticket.requester,
      created_at: ticket.created_at,
      description: ticket.description
    }]),
    ...(ticket.histories || [])
  ] : [];

  const getActionTitle = (h: any) => {
    if (h.id === "submit-0" || h.phase === "submit" || h.phase === "submission") return "Submit Ticket";
    if (h.phase === "approval") return "Approval L1";
    if (h.phase === "proof") return "Assigned Proof Of Work";
    if (h.phase === "confirmation" || h.phase === "verification") return "Confirmation";
    return h.action;
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-800 mb-2">
          {ticket.ticket_number} Ticket Title: <span className="font-bold capitalize">{ticket.ticket_type.replace('_', ' ')}</span>...
          {ticket.status === "running" ? (
            <span className="inline-block ml-2 w-4 h-4 rounded-full bg-green-500 align-middle shadow-sm text-white text-[10px] text-center leading-4 font-bold border border-green-600">R</span>
          ) : (
            <span className="inline-block ml-2 w-4 h-4 rounded-full bg-gray-400 align-middle shadow-sm text-white text-[10px] text-center leading-4 font-bold border border-gray-500">C</span>
          )}
        </h1>
        <div className="text-sm text-gray-500 flex gap-6">
          <span>Process Display Name: <span className="font-medium text-gray-700">Centralized Inquiry Ticket</span></span>
          <span>Phase Name: <span className="font-medium text-gray-700 capitalize">{ticket.current_phase}</span></span>
          <span>Updated At: <span className="font-medium text-gray-700">{new Date(ticket.updated_at).toLocaleString()}</span></span>
          <span>Requester: <span className="font-medium text-gray-700">{ticket.requester?.username}</span></span>
        </div>
      </div>

      {/* Accordion 1: Basic Information */}
      <details className="group bg-white shadow-sm border border-gray-200 rounded-md mb-2" open>
        <summary className="flex items-center cursor-pointer p-3 border-b border-gray-200 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition list-none">
          <span className="transform group-open:rotate-90 transition-transform mr-2 text-gray-400 text-xs">▶</span>
          Basic Information
        </summary>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Ticket ID</label>
              <input type="text" disabled value={ticket.ticket_number} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Ticket Title</label>
              <input type="text" disabled value={ticket.ticket_type.replace('_', ' ') + " Account"} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700 capitalize" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Description</label>
              <textarea disabled value={ticket.description} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700 min-h-20" />
            </div>
          </div>
        </div>
      </details>

      {/* Accordion 2: Account Information */}
      <details className="group bg-white shadow-sm border border-gray-200 rounded-md mb-2" open>
        <summary className="flex items-center cursor-pointer p-3 border-b border-gray-200 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition list-none">
          <span className="transform group-open:rotate-90 transition-transform mr-2 text-gray-400 text-xs">▶</span>
          Account Information (Target)
        </summary>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Username</label>
              <input type="text" disabled value={ticket.target_username} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <input type="text" disabled value={ticket.target_email} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone</label>
              <input type="text" disabled value={ticket.target_phone || "-"} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700" />
            </div>
          </div>
        </div>
      </details>

      {/* Accordion 3: User Information */}
      <details className="group bg-white shadow-sm border border-gray-200 rounded-md mb-4" open>
        <summary className="flex items-center cursor-pointer p-3 border-b border-gray-200 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition list-none">
          <span className="transform group-open:rotate-90 transition-transform mr-2 text-gray-400 text-xs">▶</span>
          User Information (Requester)
        </summary>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Username</label>
              <input type="text" disabled value={ticket.requester?.username} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <input type="text" disabled value={ticket.requester?.email} className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700" />
            </div>
          </div>
        </div>
      </details>

      {/* Ticket Action Panel (Approval/Proof/etc form) */}
      <TicketActionPanel ticket={ticket} onSuccess={fetchTicket} />

      {/* Accordion 4: More Information (History) */}
      <details className="group bg-white shadow-sm border border-gray-200 rounded-md mb-8" open>
        <summary className="flex items-center cursor-pointer p-3 font-medium text-gray-700 hover:bg-gray-50 transition list-none border-b border-gray-100">
          <span className="transform group-open:rotate-90 transition-transform mr-2 text-gray-400 text-xs">▶</span>
          More Information
        </summary>
        <div className="bg-white">
          <div className="flex border-b border-gray-200 text-sm overflow-x-auto">
            <span className="px-4 py-3 text-blue-600 border-b-2 border-blue-600 font-medium whitespace-nowrap">Ticket Operation Details</span>
          </div>
          <div className="p-0 bg-gray-100 flex flex-col gap-px border-t border-gray-200">
            {allHistories.map((h: any) => (
              <details key={h.id} className="group/item bg-white">
                <summary className="flex items-center justify-between cursor-pointer p-3 text-sm text-gray-700 hover:bg-gray-50 transition list-none bg-gray-50">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="transform group-open/item:rotate-90 transition-transform text-gray-400 text-[10px]">▶</span>
                    {getActionTitle(h)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {(h.actor?.email && h.actor?.username) ? `${h.actor.email} - ${h.actor.username}` : (h.actor?.username || "System - System")} {formatDate(h.created_at)}
                  </div>
                </summary>
                <div className="p-6 bg-white text-sm border-t border-gray-100">
                  {(h.action === "Submit Ticket" || h.action === "submit" || h.action === "resubmit" || h.phase === "submit" || h.phase === "submission") && (() => {
                    let dispEmail = ticket.target_email || "-";
                    let dispUsername = ticket.target_username || "-";
                    let dispPhone = ticket.target_phone || "-";
                    let dispDesc = h.description || "-";
                    if (h.description && h.description.trim().startsWith('{')) {
                      try {
                        const parsed = JSON.parse(h.description);
                        if (parsed.target_email !== undefined) {
                          dispEmail = parsed.target_email;
                          dispUsername = parsed.target_username;
                          dispDesc = parsed.description;
                        }
                      } catch (e) { }
                    }
                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-8">
                          <div>
                            <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Target Email</h4>
                            <div className="p-2.5 bg-gray-100 rounded text-gray-700">{dispEmail || "-"}</div>
                          </div>
                          <div>
                            <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Target Username</h4>
                            <div className="p-2.5 bg-gray-100 rounded text-gray-700">{dispUsername || "-"}</div>
                          </div>
                          <div>
                            <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Target Phone</h4>
                            <div className="p-2.5 bg-gray-100 rounded text-gray-700">{dispPhone || "-"}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Description</h4>
                          <div className="p-3 bg-gray-100 rounded text-gray-700 whitespace-pre-wrap min-h-20">{dispDesc || "-"}</div>
                        </div>
                      </div>
                    );
                  })()}
                  {h.phase === "approval" && h.action !== "Submit Ticket" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Approval</h4>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 text-gray-600">
                            <input type="radio" checked={h.action.toLowerCase().includes("accept") || h.action.toLowerCase().includes("approve")} readOnly className="accent-blue-500" /> Accept
                          </label>
                          <label className="flex items-center gap-2 text-gray-600">
                            <input type="radio" checked={h.action.toLowerCase().includes("reject")} readOnly className="accent-blue-500" /> Reject
                          </label>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Description</h4>
                        <div className="p-3 bg-gray-100 rounded text-gray-700 whitespace-pre-wrap min-h-20">{h.description || "-"}</div>
                      </div>
                    </div>
                  )}
                  {h.phase === "proof" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-base mb-1">Account Information</h4>

                        {/* <div className="grid grid-cols-2 gap-8 max-w-2xl">
                          <div>
                            <h4 className="text-red-500 text-xs mb-1">* Account ID</h4>
                            <div className="p-2.5 bg-gray-100 rounded text-gray-700 h-10">{ticket.target_account_id ? ticket.target_username : ""}</div>
                          </div>
                          <div></div>
                        </div> */}
                      </div>
                      <div>
                        <h4 className="text-gray-700 text-sm mb-2">Evidence</h4>
                        {h.proof_image ? (
                          <a href={`${API_BASE_URL.replace('/api/v1', '')}${h.proof_image}`} target="_blank" rel="noreferrer" className="block w-fit">
                            <img 
                              src={`${API_BASE_URL.replace('/api/v1', '')}${h.proof_image}`} 
                              alt="Proof Evidence" 
                              className="max-h-40 object-contain border border-gray-200 rounded shadow-sm hover:opacity-80 transition cursor-pointer"
                            />
                          </a>
                        ) : (
                          <div className="px-4 py-2 border rounded bg-gray-50 text-gray-500 shadow-sm w-fit text-sm italic">No image (Proof by system)</div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Description</h4>
                        <div className="p-3 bg-gray-100 rounded text-gray-700 whitespace-pre-wrap min-h-20">{h.description || "-"}</div>
                      </div>
                    </div>
                  )}
                  {h.phase === "confirmation" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-gray-700 text-sm mb-2"><span className="text-red-500 mr-1">*</span>User Confirmation</h4>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 text-gray-600">
                            <input type="radio" checked={h.action === "confirm_accept"} readOnly className="accent-blue-500" /> Accept
                          </label>
                          <label className="flex items-center gap-2 text-gray-600">
                            <input type="radio" checked={h.action === "confirm_reject"} readOnly className="accent-blue-500" /> Reject
                          </label>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-gray-700 text-sm mb-1"><span className="text-red-500 mr-1">*</span>Description</h4>
                        <div className="p-3 bg-gray-100 rounded text-gray-700 whitespace-pre-wrap min-h-20">{h.description || "-"}</div>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </details>

      <div className="mt-8 mb-12">
        <Link to="/tickets" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; Back to Tickets
        </Link>
      </div>
    </div>
  );
}
