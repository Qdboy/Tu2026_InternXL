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
  interests: string[];
  transport: string[];
}

export const partyStyles: Record<string, { badge: string }> = {
  Democrat: { badge: "bg-[hsl(215,50%,93%)] text-[hsl(215,50%,32%)]" },
  Republican: { badge: "bg-[hsl(0,60%,95%)] text-[hsl(0,50%,30%)]" },
  Independent: { badge: "bg-mint text-forest" },
};
