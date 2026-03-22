import { useState } from "react";

interface Candidate {
  id: string;
  name: string;
  initials: string;
  position: string;
  party: "dem" | "rep" | "ind";
  policies: string[];
  previousPositions: string;
  organizations?: string;
  level: "federal" | "state" | "local";
  electionTitle: string;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Angela Robinson",
    initials: "AR",
    position: "Running for U.S. House – GA-05",
    party: "dem",
    policies: ["Healthcare", "Education", "Climate"],
    previousPositions: "Georgia State Senator (2018–2024), DeKalb County Board (2014–2018)",
    organizations: "NAACP · Sierra Club · GA Education Alliance",
    level: "federal",
    electionTitle: "U.S. House – GA-05",
  },
  {
    id: "2",
    name: "James Mitchell",
    initials: "JM",
    position: "Running for U.S. House – GA-05",
    party: "rep",
    policies: ["Tax Cuts", "Border Security", "2nd Amendment"],
    previousPositions: "U.S. House Rep (2020–2024), Fulton County DA (2016–2020)",
    organizations: "NRA · GA Business Coalition · Heritage Foundation",
    level: "federal",
    electionTitle: "U.S. House – GA-05",
  },
  {
    id: "3",
    name: "Lisa Torres",
    initials: "LT",
    position: "Running for Governor of Georgia",
    party: "dem",
    policies: ["Medicaid Expansion", "Affordable Housing", "Criminal Justice"],
    previousPositions: "GA Lt. Governor (2019–present), GA State Rep (2013–2019)",
    level: "state",
    electionTitle: "Georgia Governor",
  },
  {
    id: "4",
    name: "Marcus Patterson",
    initials: "MP",
    position: "Running for Atlanta Mayor",
    party: "ind",
    policies: ["Affordable Housing", "Transit", "Public Safety"],
    previousPositions: "Atlanta City Council (2016–2024), District Attorney (2012–2016)",
    level: "local",
    electionTitle: "Atlanta Mayor",
  },
];

const PARTY_STYLES = {
  dem: {
    avatar: "bg-gradient-to-br from-[#2c5282] to-[#3a78b0]",
    badge: "bg-[#EBF2FF] text-[#2c5282]",
    label: "Democrat",
  },
  rep: {
    avatar: "bg-gradient-to-br from-[#7B1E1E] to-[#A83232]",
    badge: "bg-[#FFF0F0] text-[#7B1E1E]",
    label: "Republican",
  },
  ind: {
    avatar: "bg-gradient-to-br from-forest to-olive",
    badge: "bg-mint text-forest",
    label: "Independent",
  },
};

const LEVEL_FILTERS = ["All", "Federal", "State", "Local"];

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("All");

  const filtered = MOCK_CANDIDATES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase());
    const matchLevel = activeLevel === "All" || c.level === activeLevel.toLowerCase();
    return matchSearch && matchLevel;
  });

  // Group by election
  const grouped = filtered.reduce<Record<string, Candidate[]>>((acc, c) => {
    if (!acc[c.electionTitle]) acc[c.electionTitle] = [];
    acc[c.electionTitle].push(c);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search bar */}
      <div className="bg-dark-char px-5 pt-3 pb-4 flex-shrink-0">
        <h1 className="font-display text-xl font-bold text-card mb-2.5">Candidates</h1>
        <div className="bg-card/10 rounded-xl py-2.5 px-4 flex items-center gap-2.5 text-card/40 text-[13px] font-semibold border border-card/8">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search candidates…"
            className="bg-transparent border-none outline-none flex-1 text-card font-body text-[13px] font-semibold placeholder:text-card/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Level filters */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-none">
          {LEVEL_FILTERS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`py-1.5 px-3 rounded-full text-[10px] font-extrabold whitespace-nowrap cursor-pointer border-2 font-body transition-all ${
                activeLevel === level
                  ? "bg-primary border-primary text-card"
                  : "border-card/15 text-card/50 bg-transparent"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {Object.entries(grouped).map(([title, candidates]) => (
            <div key={title} className="mb-6">
              <div className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-[1.2px] mb-3 flex items-center gap-2">
                {title}
                <div className="flex-1 h-px bg-border" />
              </div>

              {candidates.map((c) => {
                const ps = PARTY_STYLES[c.party];
                return (
                  <div
                    key={c.id}
                    className="bg-card rounded-2xl p-4 mb-3 shadow-[0_2px_10px_rgba(42,48,40,0.07)] border border-border cursor-pointer hover:shadow-[0_4px_20px_rgba(42,48,40,0.14)] transition-shadow"
                  >
                    {/* Top row */}
                    <div className="flex gap-3 mb-3">
                      <div className={`w-[54px] h-[54px] rounded-[14px] flex items-center justify-center text-lg font-black font-display text-card flex-shrink-0 ${ps.avatar}`}>
                        {c.initials}
                      </div>
                      <div className="flex-1">
                        <div className="font-display text-base font-bold text-foreground mb-0.5">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground mb-1.5">{c.position}</div>
                        <span className={`inline-block py-[3px] px-2.5 rounded-[10px] text-[10px] font-extrabold ${ps.badge}`}>
                          {ps.label}
                        </span>
                      </div>
                    </div>

                    {/* Policies */}
                    <div className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1.5">Key Policies</div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {c.policies.map((p) => (
                        <span key={p} className="py-1 px-2.5 rounded-full text-[10px] font-bold bg-background text-foreground border border-border">
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Previous positions */}
                    <div className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1">Previous Positions</div>
                    <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{c.previousPositions}</p>

                    {c.organizations && (
                      <>
                        <div className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1">Affiliated Organizations</div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{c.organizations}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
