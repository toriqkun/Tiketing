import { useState } from "react";
import type { FormEvent } from "react";
import { confirmPassword } from "../lib/account.service";

interface ConfirmPasswordDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmPasswordDialog({
  onConfirm,
  onCancel,
}: ConfirmPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmPassword(password);
      onConfirm();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded p-6 max-w-sm w-full">
        <h3 className="font-bold text-lg mb-4">Confirm Admin Password</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your password to confirm this sensitive action.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 mb-4"
            placeholder="Your password"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Confirm Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
