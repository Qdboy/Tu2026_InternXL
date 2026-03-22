import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Search, Loader2, Sparkles, RefreshCw } from "lucide-react";
import LevelTag from "@/components/LevelTag";
import CandidateAvatar from "@/components/CandidateAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Level = "local" | "state" | "federal";

interface Candidate {
  name: string;
  party: string;
  position: string;
  policies: string[];
  relevance_score: number;
  relevance_reason: string;
}

interface Recommendation {
  office: string;
  level: Level;
  why_it_matters: string;
  candidates: Candidate[];
}

interface UserProfile {
  name: string;
  occupation: string;
  zipCode: string;
  interests: string[];
  transport: string[];
}

const partyStyles: Record<string, { avatar: string; badge: string }> = {
  Democrat: { avatar: "bg-gradient-to-br from-[#2c5282] to-[#3a78b0]", badge: "bg-[#EBF2FF] text-[#2c5282]" },
  Republican: { avatar: "bg-gradient-to-br from-[#7B1E1E] to-[#A83232]", badge: "bg-[#FFF0F0] text-[#7B1E1E]" },
  Independent: { avatar: "bg-gradient-to-br from-forest to-olive", badge: "bg-mint text-forest" },
};

const Candidates = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("votewise_profile");
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const fetchRecommendations = async () => {
    if (!profile || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-candidates", {
        body: { profile },
      });
      if (error) throw error;
      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (e: any) {
      console.error("Recommend error:", e);
      toast({ title: "Couldn't load recommendations", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [profile]);

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-forest bg-mint";
    if (score >= 50) return "text-primary bg-orange-pale";
    return "text-muted-foreground bg-secondary";
  };

  const filtered = searchQuery
    ? recommendations.filter((r) =>
        r.office.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.candidates.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recommendations;

  return (
    <div>
      <div className="bg-dark-surface px-5 pt-4 pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-bold text-white">Candidates</h1>
            <p className="text-xs text-white/40 mt-0.5">Personalized for your interests</p>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <button
                onClick={fetchRecommendations}
                disabled={loading}
                className="text-orange-light hover:text-orange-light/80 transition-colors disabled:opacity-50"
                title="Refresh recommendations"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 bg-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2 border border-white/[0.08]">
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search candidates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[13px] font-semibold text-white placeholder:text-white/40 outline-none w-full"
          />
        </div>
      </div>

      {!profile ? (
        <div className="text-center py-20 px-4">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Complete onboarding to get personalized candidate recommendations.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Finding candidates that match your interests…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-4">
          <p className="text-muted-foreground text-sm">No recommendations yet.</p>
          <button onClick={fetchRecommendations} disabled={loading} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">
            Get Recommendations
          </button>
        </div>
      ) : (
        <div className="px-3.5 pt-3.5 pb-6">
          {filtered.map((rec, ri) => (
            <div key={ri} className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <LevelTag level={rec.level} />
                <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-[1.2px]">{rec.office}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Why it matters banner */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.1 }}>
                <div className="rounded-xl bg-orange-pale border border-primary/10 p-3 mb-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-[1px]">Why this matters to you</span>
                  </div>
                  <p className="text-[12px] text-foreground leading-relaxed">{rec.why_it_matters}</p>
                </div>
              </motion.div>

              {rec.candidates.map((candidate, ci) => {
                const styles = partyStyles[candidate.party] || partyStyles.Independent;
                return (
                  <motion.div key={ci} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.1 + ci * 0.05 }}>
                    <Card className="rounded-2xl p-3.5 mb-2.5 shadow-sm">
                      <div className="flex gap-3 mb-2.5">
                        <CandidateAvatar name={candidate.name} party={candidate.party} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-[15px] font-bold text-foreground mb-0.5">{candidate.name}</h3>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${getScoreColor(candidate.relevance_score)}`}>
                              {candidate.relevance_score}% match
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-1">{candidate.position}</p>
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${styles.badge}`}>{candidate.party}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1">Key Policies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.policies.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background text-foreground border border-border">{p}</span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg bg-secondary/50 p-2.5">
                        <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-0.5">Why they match your interests</p>
                        <p className="text-[11px] text-foreground leading-relaxed">{candidate.relevance_reason}</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
