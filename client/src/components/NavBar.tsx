import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/authContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    if (!name) return "bg-blue-600";
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500",
      "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500",
      "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <nav className="bg-white border-b shadow-sm px-8 md:px-12 py-4 flex items-center justify-between relative z-50">
      <div className="font-bold text-xl text-blue-600">
        <p>Operation Maintenance</p>
      </div>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-gray-600 font-medium hover:text-blue-600 transition">
          Dashboard
        </Link>
        <Link to="/tickets" className="text-gray-600 font-medium hover:text-blue-600 transition">
          Ticket Query
        </Link>
        <Link to="/users" className="text-gray-600 font-medium hover:text-blue-600 transition">
          User Management
        </Link>

        <div className="ml-4 border-l pl-4 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 px-2 py-1 rounded-md transition"
          >
            <div className={`w-9 h-9 rounded-full ${getAvatarColor(user?.username || "")} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
              {getInitials(user?.username || "")}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.username}</span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile Detail
              </Link>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
