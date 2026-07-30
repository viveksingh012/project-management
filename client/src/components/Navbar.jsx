import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/utils";

function Logo() {
  return (
    <Link to="/projects" className="flex items-center gap-2.5 group">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M2 20L9 6L13 14L16 9L24 20"
          stroke="#234B3D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:stroke-[#E2A33D] transition-colors"
        />
        <circle cx="16" cy="9" r="1.6" fill="#E2A33D" />
      </svg>
      <span className="font-display text-lg tracking-tight text-ink">
        Project Camp
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-paper-dim transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-forest text-paper flex items-center justify-center text-xs font-mono">
                {initials(user.username || user.email)}
              </span>
              <span className="text-sm text-ink hidden sm:block">
                {user.username || user.email}
              </span>
              <ChevronDown size={16} className="text-ink-soft" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-sm shadow-lg py-1">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-paper-dim"
                >
                  <User size={15} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-clay hover:bg-paper-dim"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
