import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import CandidateAvatar from "@/components/CandidateAvatar";
import LevelTag from "@/components/LevelTag";
import { Candidate, Recommendation, partyStyles } from "./types";

interface Props {
  office: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCandidate: (c: Candidate) => void;
}

const OfficeDetailDialog = ({ office, open, onOpenChange, onSelectCandidate }: Props) => {
  if (!office) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <LevelTag level={office.level} />
          </div>
          <DialogTitle className="font-display text-lg">{office.office}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sr-only">
            Candidates running for {office.office}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-2">
          <div className="rounded-xl bg-orange-pale border border-primary/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[1px]">Why this matters to you</span>
            </div>
            <p className="text-[12px] text-foreground leading-relaxed">{office.why_it_matters}</p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-2.5">
            {office.candidates.length} Candidates
          </p>
          <div className="space-y-2">
            {office.candidates.map((c, i) => {
              const styles = partyStyles[c.party] || partyStyles.Independent;
              return (
                <button
                  key={i}
                  onClick={() => onSelectCandidate(c)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors text-left"
                >
                  <CandidateAvatar name={c.name} party={c.party} className="w-10 h-10 text-xs" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[14px] font-bold text-foreground truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.position}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${styles.badge}`}>{c.party}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{c.relevance_score}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfficeDetailDialog;
