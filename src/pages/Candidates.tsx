import { useState, useEffect } from "react";
import { Search, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/use-user-location";
import OfficeCard from "@/components/candidates/OfficeCard";
import OfficeDetailDialog from "@/components/candidates/OfficeDetailDialog";
import CandidateDetailDialog from "@/components/candidates/CandidateDetailDialog";
import { Recommendation, Candidate } from "@/components/candidates/types";

const Candidates = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useUserLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<Recommendation | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const { toast } = useToast();

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

  const filtered = searchQuery
    ? recommendations.filter((r) =>
        r.office.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.candidates.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recommendations;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="bg-dark-surface px-5 pt-4 pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-black text-on-dark">Races</h1>
            <p className="text-xs text-on-dark/40 mt-0.5">Explore offices &amp; candidates</p>
          </div>
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
        <div className="mt-3 bg-on-dark/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2 border border-on-dark/[0.08]">
          <Search className="w-4 h-4 text-on-dark/40" />
          <input
            type="text"
            placeholder="Search offices or candidates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[13px] font-semibold text-on-dark placeholder:text-on-dark/40 outline-none w-full"
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
          <p className="text-sm text-muted-foreground">Finding races near you…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-4">
          <p className="text-muted-foreground text-sm">No races found.</p>
          <button onClick={fetchRecommendations} disabled={loading} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">
            Get Recommendations
          </button>
        </div>
      ) : (
        <div className="px-3.5 pt-3.5 pb-6 space-y-3">
          {filtered.map((rec, i) => (
            <OfficeCard key={i} office={rec} index={i} onSelect={setSelectedOffice} />
          ))}
        </div>
      )}

      <OfficeDetailDialog
        office={selectedOffice}
        open={!!selectedOffice}
        onOpenChange={(open) => !open && setSelectedOffice(null)}
        onSelectCandidate={(c) => {
          setSelectedCandidate(c);
        }}
      />

      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      />
    </div>
  );
};

export default Candidates;
