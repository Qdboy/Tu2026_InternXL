import { useState } from "react";
import { toast } from "sonner";

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  level: "federal" | "state" | "local";
  tags: { label: string; className: string }[];
  upvotes: string;
  comments: string;
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "Senate Passes Bipartisan Infrastructure Spending Bill",
    source: "Reuters · Washington",
    time: "2h ago",
    level: "federal",
    tags: [
      { label: "💰 Economy", className: "bg-[#FEF3E2] text-burnt" },
      { label: "🏘️ Housing", className: "bg-orange-pale text-primary" },
    ],
    upvotes: "1.2k",
    comments: "348",
  },
  {
    id: "2",
    title: "Georgia Legislature Debates Education Funding Overhaul",
    source: "AJC · Atlanta, GA",
    time: "5h ago",
    level: "state",
    tags: [
      { label: "🎓 Education", className: "bg-[#E8F4E0] text-forest" },
      { label: "💰 Economy", className: "bg-[#FEF3E2] text-burnt" },
    ],
    upvotes: "842",
    comments: "197",
  },
  {
    id: "3",
    title: "Atlanta City Council Approves Affordable Housing Expansion",
    source: "Atlanta Civic Press",
    time: "8h ago",
    level: "local",
    tags: [
      { label: "🏘️ Housing", className: "bg-orange-pale text-primary" },
      { label: "🌿 Environment", className: "bg-[#EDF6E5] text-olive" },
    ],
    upvotes: "523",
    comments: "91",
  },
  {
    id: "4",
    title: "Federal Reserve Holds Interest Rates Amid Economic Uncertainty",
    source: "AP News · D.C.",
    time: "11h ago",
    level: "federal",
    tags: [{ label: "💰 Economy", className: "bg-[#FEF3E2] text-burnt" }],
    upvotes: "2.1k",
    comments: "512",
  },
  {
    id: "5",
    title: "Governor Signs New Environmental Protection Act Into Law",
    source: "GPB News · Georgia",
    time: "1d ago",
    level: "state",
    tags: [
      { label: "🌿 Environment", className: "bg-[#EDF6E5] text-olive" },
      { label: "🏥 Healthcare", className: "bg-mint text-slate" },
    ],
    upvotes: "634",
    comments: "88",
  },
];

const FILTERS = ["All", "Federal", "State", "Local", "For You"];

const LEVEL_STYLES = {
  federal: {
    bg: "bg-gradient-to-br from-dark-char to-[#354030]",
    badge: "bg-primary/90 text-on-dark",
    badgeLabel: "⬟ Federal",
  },
  state: {
    bg: "bg-gradient-to-br from-forest to-[#4a8020]",
    badge: "bg-on-dark/92 text-forest",
    badgeLabel: "◈ State",
  },
  local: {
    bg: "bg-gradient-to-br from-burnt to-primary",
    badge: "bg-on-dark/92 text-burnt",
    badgeLabel: "◉ Local",
  },
};

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All" || activeFilter === "For You"
      ? MOCK_NEWS
      : MOCK_NEWS.filter((n) => n.level === activeFilter.toLowerCase());

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Filter bar */}
      <div className="bg-dark-char pt-3 flex-shrink-0">
        <div className="flex gap-0.5 justify-center overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`py-2.5 px-[18px] rounded-t-[18px] text-[11px] font-extrabold whitespace-nowrap cursor-pointer tracking-[0.4px] bg-transparent border-none font-body transition-all min-h-[44px] ${
                activeFilter === f
                  ? "bg-background text-dark-char"
                  : "text-on-dark/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-3.5">
          {filtered.map((article) => {
            const style = LEVEL_STYLES[article.level];
            return (
              <div
                key={article.id}
                className="bg-card rounded-[18px] overflow-hidden shadow-[0_2px_14px_rgba(42,48,40,0.08)] border border-border cursor-pointer hover:translate-y-[-2px] hover:shadow-[0_6px_24px_rgba(42,48,40,0.13)] transition-all"
              >
                {/* Image header */}
                <div className={`h-[140px] relative overflow-hidden flex items-end p-3 ${style.bg}`}>
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(55deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_12px)]" />
                  <span className={`py-1 px-2.5 rounded-full text-[9px] font-extrabold tracking-[0.9px] uppercase z-10 ${style.badge}`}>
                    {style.badgeLabel}
                  </span>
                </div>

                {/* Body */}
                <div className="p-3.5">
                  <h3 className="font-display text-base font-bold text-foreground leading-tight mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] text-muted-foreground font-bold">{article.source}</span>
                    <span className="text-[10px] text-sage">{article.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span key={tag.label} className={`py-[3px] px-2.5 rounded-[10px] text-[10px] font-bold ${tag.className}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex px-3.5 py-2.5 border-t border-border gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-sage font-semibold cursor-pointer hover:text-primary transition-colors">
                    ▲ {article.upvotes}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-sage font-semibold cursor-pointer hover:text-primary transition-colors">
                    💬 {article.comments}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-[11px] text-sage font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => toast("Link copied!")}
                  >
                    ↗ Share
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
