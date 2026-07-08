import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../lib/authContext";
import {
  resubmitTicket,
  reviewTicket,
  proofTicket,
  confirmTicket,
} from "../lib/ticket.service";

interface TicketActionPanelProps {
  ticket: any;
  onSuccess: () => void;
}

export default function TicketActionPanel({
  ticket,
  onSuccess,
}: TicketActionPanelProps) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resubmit fields
  const [description, setDescription] = useState(ticket.description || "");
  const [targetUsername, setTargetUsername] = useState(
    ticket.target_username || "",
  );
  const [targetEmail, setTargetEmail] = useState(ticket.target_email || "");
  const [targetPhone, setTargetPhone] = useState(ticket.target_phone || "");

  // Review / Confirm fields
  const [decision, setDecision] = useState<"accept" | "reject">("accept");
  const [checked, setChecked] = useState(false);
  const [actionDescription, setActionDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasteClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        if (imageTypes.length > 0) {
          const imageType = imageTypes[0];
          const blob = await clipboardItem.getType(imageType);
          const ext = imageType.split('/')[1] || 'png';
          const file = new File([blob], `Clipboard_${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`, { type: imageType });
          if (file.size > 2 * 1024 * 1024) {
            setError("File size exceeds 2 MB limit");
          } else {
            setProofFile(file);
            setError("");
          }
          return;
        }
      }
      alert("No image found in clipboard.");
    } catch (err) {
      console.error(err);
      alert("Unable to read clipboard. You may need to grant permission or paste using Ctrl+V directly into the browser.");
    }
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (ticket.current_phase === "proof" && (!ticket.target_account_id || ticket.ticket_type === "upgrade")) {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  setError("File size exceeds 2 MB limit");
                } else {
                  setProofFile(file);
                  setError("");
                }
              }
              break;
            }
          }
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [ticket]);

  // Proof fields
  const [proofFile, setProofFile] = useState<File | null>(null);

  if (ticket.status === "closed" || ticket.current_phase === "completed") {
    return null;
  }

  const isRequester = user?.id === ticket.requester_id;
  const isAdmin = user?.is_admin;

  const handleAction = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (ticket.current_phase === "submit" && isRequester) {
        await resubmitTicket(ticket.id, {
          description,
          target_username: targetUsername,
          target_email: targetEmail,
          target_phone: targetPhone,
        });
      } else if (ticket.current_phase === "approval" && isAdmin) {
        await reviewTicket(ticket.id, {
          checked,
          decision,
          description: actionDescription,
        });
      } else if (
        ticket.current_phase === "proof" &&
        isAdmin
      ) {
        const formData = new FormData();
        formData.append("description", actionDescription);
        if (proofFile) {
          formData.append("proof_image", proofFile);
        }

        await proofTicket(ticket.id, formData);
      } else if (ticket.current_phase === "confirmation" && isRequester) {
        await confirmTicket(ticket.id, {
          decision,
          description: actionDescription,
        });
      } else {
        throw new Error(
          "You do not have permission to perform actions in this phase",
        );
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const renderSubmitPhase = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 min-h-25"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Target Username</label>
          <input
            type="text"
            required
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Target Email</label>
          <input
            type="email"
            required
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Target Phone</label>
          <input
            type="text"
            required
            value={targetPhone}
            onChange={(e) => setTargetPhone(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition disabled:opacity-50"
        >
          Resubmit
        </button>
      </div>
    </>
  );

  const renderReviewPhase = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Check</label>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="h-4 w-4 mt-1 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Approval</label>
          <div className="flex items-center gap-6 mt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="decision"
                value="accept"
                checked={decision === "accept"}
                onChange={() => setDecision("accept")}
                className="h-4 w-4 text-blue-600"
              />
              Accept
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="decision"
                value="reject"
                checked={decision === "reject"}
                onChange={() => setDecision("reject")}
                className="h-4 w-4 text-blue-600"
              />
              Reject
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Description</label>
          <textarea
            required
            value={actionDescription}
            onChange={(e) => setActionDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 min-h-25"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={!checked || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </>
  );

  const renderProofPhase = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-2">Evidence</label>

          <input
            type="file"
            accept="image/jpeg, image/png, image/jpg, image/gif"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.size > 2 * 1024 * 1024) {
                  setError("File size exceeds 2 MB limit");
                  e.target.value = "";
                } else {
                  setProofFile(file);
                  setError("");
                }
              }
            }}
          />

          {proofFile ? (
            <div className="mb-4">
              <a href={URL.createObjectURL(proofFile)} target="_blank" rel="noreferrer" className="block w-fit mb-2">
                <img 
                  src={URL.createObjectURL(proofFile)} 
                  alt="Proof Preview" 
                  className="max-h-40 object-contain border border-gray-200 rounded shadow-sm hover:opacity-80 transition cursor-pointer"
                />
              </a>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium truncate max-w-50">{proofFile.name}</span>
                <button type="button" onClick={() => setProofFile(null)} className="text-sm text-red-500 hover:underline">
                  Remove
                </button>
                <button type="button" onClick={handlePasteClipboard} className="border px-4 py-1.5 rounded bg-white text-gray-700 hover:bg-gray-50 text-sm shadow-sm">
                  Paste Another
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 mb-4 text-sm">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="border px-4 py-1.5 rounded flex items-center gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100 shadow-sm">
                <span className="text-lg leading-none mb-0.5">+</span> Add
              </button>
              <span className="text-gray-500">File type: msg,png,jpg,j...</span>
              <button type="button" onClick={handlePasteClipboard} className="border px-4 py-1.5 rounded bg-white text-gray-700 hover:bg-gray-50 shadow-sm">
                Paste Clipboard
              </button>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Description</label>
          <textarea
            required
            value={actionDescription}
            onChange={(e) => setActionDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 min-h-25"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition disabled:opacity-50"
        >
          Submit Proof
        </button>
      </div>
    </>
  );

  const renderConfirmPhase = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>User Confirmation</label>
          <div className="flex items-center gap-6 mt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="decision"
                value="accept"
                checked={decision === "accept"}
                onChange={() => setDecision("accept")}
                className="h-4 w-4 text-blue-600"
              />
              Accept
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="decision"
                value="reject"
                checked={decision === "reject"}
                onChange={() => setDecision("reject")}
                className="h-4 w-4 text-blue-600"
              />
              Reject
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500 mr-1">*</span>Description</label>
          <textarea
            required
            value={actionDescription}
            onChange={(e) => setActionDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-blue-500 min-h-25"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </>
  );

  let renderContent = null;
  if (ticket.current_phase === "submit" && isRequester)
    renderContent = renderSubmitPhase();
  if (ticket.current_phase === "approval" && isAdmin)
    renderContent = renderReviewPhase();
  if (
    ticket.current_phase === "proof" &&
    isAdmin
  )
    renderContent = renderProofPhase();
  if (ticket.current_phase === "confirmation" && isRequester)
    renderContent = renderConfirmPhase();

  if (!renderContent) {
    return (
      <div className="bg-white p-6 shadow-sm border border-l-4 border-l-yellow-400 rounded-md mt-6">
        <p className="text-gray-600 text-sm">
          Waiting for action from{" "}
          <span className="font-semibold text-gray-800">
            {ticket.current_phase === "approval" || ticket.current_phase === "proof"
              ? "Admin / Supervisor"
              : "Requester"}
          </span>
          ...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleAction} className="bg-white p-8 border rounded-md mb-4 shadow-sm">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-6 rounded text-sm">{error}</div>
      )}
      {renderContent}
    </form>
  );
}
