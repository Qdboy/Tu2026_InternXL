export type Level = "local" | "state" | "federal";

export interface Candidate {
  name: string;
  party: string;
  position: string;
  policies: string[];
  relevance_score: number;
  relevance_reason: string;
}

export interface Recommendation {
  office: string;
  level: Level;
  why_it_matters: string;
  candidates: Candidate[];
}

export interface UserProfile {
  name: string;
  occupation: string;
  zipCode: string;
  city?: string;
  state?: string;
  interests: string[];
  transport: string[];
}

export const partyStyles: Record<string, { badge: string }> = {
  Democrat: { badge: "bg-[hsl(215,50%,93%)] text-[hsl(215,50%,32%)]" },
  Democratic: { badge: "bg-[hsl(215,50%,93%)] text-[hsl(215,50%,32%)]" },
  "Democratic Party": { badge: "bg-[hsl(215,50%,93%)] text-[hsl(215,50%,32%)]" },
  Republican: { badge: "bg-[hsl(0,60%,95%)] text-[hsl(0,50%,30%)]" },
  "Republican Party": { badge: "bg-[hsl(0,60%,95%)] text-[hsl(0,50%,30%)]" },
  Independent: { badge: "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,28%)]" },
  Libertarian: { badge: "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,28%)]" },
  Green: { badge: "bg-[hsl(140,40%,92%)] text-[hsl(140,40%,28%)]" },
};

export function getPartyStyle(party: string) {
  return partyStyles[party] || partyStyles[
    Object.keys(partyStyles).find(k => party.toLowerCase().includes(k.toLowerCase())) || "Independent"
  ] || partyStyles.Independent;
}
