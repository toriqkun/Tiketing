import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/authContext";

export default function ExtendReminderModal() {
  const { user, daysUntilExpiry } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (
      user &&
      !user.is_admin &&
      daysUntilExpiry !== null &&
      daysUntilExpiry <= 14
    ) {
      // Check if already dismissed in this session
      const dismissed = sessionStorage.getItem("extend_reminder_dismissed");
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }, [user, daysUntilExpiry]);

  const handleDismiss = () => {
    sessionStorage.setItem("extend_reminder_dismissed", "true");
    setIsOpen(false);
  };

  const handleExtend = () => {
    sessionStorage.setItem("extend_reminder_dismissed", "true");
    setIsOpen(false);
    navigate("/tickets/new?type=extend");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-red-600">
            Account Expiring Soon
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-700 mb-6">
          Your account will expire in{" "}
          <span className="font-bold text-red-600">{daysUntilExpiry} days</span>
          . To avoid losing access to the system, please submit an extension
          request as soon as possible.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Remind Me Later
          </button>
          <button
            onClick={handleExtend}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium shadow-sm"
          >
            Ajukan Perpanjangan
          </button>
        </div>
      </div>
    </div>
  );
}
