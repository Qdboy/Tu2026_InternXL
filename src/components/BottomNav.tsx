import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/feed", icon: "📰", label: "Feed" },
  { path: "/events", icon: "📍", label: "Events" },
  { path: "/candidates", icon: "🏛️", label: "Candidates" },
  { path: "/documents", icon: "📄", label: "Documents" },
  { path: "/personal", icon: "👤", label: "Personal" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bg-dark-char flex items-center justify-around border-t-2 border-accent/22 flex-shrink-0 pt-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path === "/feed" && location.pathname === "/");
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-[3px] cursor-pointer py-2 px-2 rounded-xl flex-1 transition-all bg-transparent border-none min-h-[44px]"
          >
            <span
              className={`text-xl transition-all ${
                isActive ? "text-orange-light -translate-y-0.5" : "text-on-dark/35"
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-bold tracking-[0.3px] ${
                isActive ? "text-orange-light" : "text-on-dark/35"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
