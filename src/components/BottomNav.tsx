import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/news", icon: "📰", label: "News" },
  { path: "/events", icon: "📍", label: "Events" },
  { path: "/candidates", icon: "🏛️", label: "Candidates" },
  { path: "/documents", icon: "📄", label: "Documents" },
  { path: "/personal", icon: "👤", label: "Personal" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="h-[68px] bg-dark-char flex items-center justify-around border-t-2 border-accent/22 flex-shrink-0 pb-1">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path === "/news" && location.pathname === "/");
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-[3px] cursor-pointer py-1.5 px-4 rounded-xl flex-1 transition-all bg-transparent border-none"
          >
            <span
              className={`text-xl transition-all ${
                isActive ? "text-orange-light -translate-y-0.5" : "text-card/35"
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-bold tracking-[0.3px] ${
                isActive ? "text-orange-light" : "text-card/35"
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
