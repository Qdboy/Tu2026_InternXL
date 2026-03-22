import { useState } from "react";
import { toast } from "sonner";

interface DocSummary {
  id: string;
  icon: string;
  name: string;
  date: string;
  summary: string;
  keyPoints: string[];
}

const MOCK_SUMMARIES: DocSummary[] = [
  {
    id: "1",
    icon: "📜",
    name: "Georgia SB-214 · Healthcare",
    date: "Summarized Mar 20, 2026",
    summary: "This bill expands Medicaid eligibility in Georgia for adults earning under 138% of the federal poverty level.",
    keyPoints: [
      "Expands coverage to ~400,000 uninsured Georgians",
      "Funded 90% by federal matching grants",
      "Requires $180M annual state budget allocation",
      "Effective date: January 1, 2027",
    ],
  },
  {
    id: "2",
    icon: "🏙️",
    name: "Atlanta Zoning Ordinance 2026-44",
    date: "Summarized Mar 18, 2026",
    summary: "Amends residential zoning to allow accessory dwelling units (ADUs) on single-family parcels citywide.",
    keyPoints: [
      "Permits up to 800 sq ft units on lots ≥ 5,000 sq ft",
      "No owner-occupancy requirement for first 5 years",
      "Aimed at increasing affordable housing stock",
    ],
  },
  {
    id: "3",
    icon: "⚖️",
    name: "HB-0892 · Criminal Justice Reform",
    date: "Summarized Mar 14, 2026",
    summary: "Proposes sentencing reform for non-violent drug offenses and expands rehabilitation program funding.",
    keyPoints: [
      "Reduces minimum sentences for first-time offenders",
      "$42M allocated for reentry support programs",
      "Establishes independent oversight board",
    ],
  },
];

export default function DocumentsPage() {
  const [linkUrl, setLinkUrl] = useState("");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-dark-char px-5 py-4 flex-shrink-0">
        <h1 className="font-display text-xl font-bold text-card">Documents</h1>
        <p className="text-xs text-card/40 mt-0.5">AI-powered civic doc summarizer</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {/* Upload zone */}
          <div
            className="border-2 border-dashed border-primary rounded-[20px] p-8 text-center bg-orange-pale mb-5 cursor-pointer hover:bg-[#fae6d8] transition-colors"
            onClick={() => toast("File picker opening…")}
          >
            <div className="text-[42px] mb-3">📋</div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1.5">Upload a Document</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              PDFs, bills, ballots, forum posts<br />We'll break it down for you
            </p>
            <div className="flex gap-2.5 justify-center flex-wrap">
              <button
                className="py-2.5 px-5 rounded-[10px] text-xs font-extrabold cursor-pointer font-body bg-dark-char text-card border-2 border-dark-char hover:bg-[#2a2f2a] transition-colors"
                onClick={(e) => { e.stopPropagation(); toast("PDF upload ready"); }}
              >
                📁 Upload PDF
              </button>
              <button
                className="py-2.5 px-5 rounded-[10px] text-xs font-extrabold cursor-pointer font-body bg-transparent text-dark-char border-2 border-dark-char hover:bg-dark-char hover:text-card transition-colors"
                onClick={(e) => { e.stopPropagation(); toast("Camera scan ready"); }}
              >
                📷 Scan
              </button>
            </div>
          </div>

          {/* Or divider */}
          <div className="text-center text-sage text-xs font-bold my-3.5 relative">
            <span className="relative z-10 bg-background px-3">or paste a link</span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -z-0" />
          </div>

          {/* Link input */}
          <div className="flex gap-2.5 mb-5">
            <input
              className="flex-1 py-3 px-3.5 border-2 border-border rounded-xl font-body text-[13px] text-foreground outline-none bg-card focus:border-orange-light transition-colors"
              placeholder="https://legis.ga.gov/bill/SB-1234…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <button
              className="py-3 px-4.5 bg-primary text-card border-none rounded-xl font-body text-[13px] font-extrabold cursor-pointer hover:bg-burnt transition-colors whitespace-nowrap"
              onClick={() => toast("Summarizing document…")}
            >
              Summarize
            </button>
          </div>

          {/* Recent summaries */}
          <div className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-3">
            Recent Summaries
          </div>

          <div className="space-y-3">
            {MOCK_SUMMARIES.map((doc) => (
              <div key={doc.id} className="bg-card rounded-2xl p-4 shadow-[0_2px_10px_rgba(42,48,40,0.07)] border border-border">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-10 h-10 rounded-[10px] bg-dark-char flex items-center justify-center text-lg flex-shrink-0">
                    {doc.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{doc.name}</div>
                    <div className="text-[10px] text-sage mt-0.5">{doc.date}</div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{doc.summary}</p>

                {doc.keyPoints.map((point, i) => (
                  <div key={i} className="flex gap-[7px] items-start mb-1 text-[11px] text-muted-foreground font-semibold">
                    <span className="text-primary text-[9px] mt-0.5 flex-shrink-0">▸</span>
                    {point}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
