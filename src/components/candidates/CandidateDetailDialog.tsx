import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CandidateAvatar from "@/components/CandidateAvatar";
import { Candidate, partyStyles } from "./types";

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CandidateDetailDialog = ({ candidate, open, onOpenChange }: Props) => {
  if (!candidate) return null;
  const styles = partyStyles[candidate.party] || partyStyles.Independent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader className="items-center text-center pb-2">
          <CandidateAvatar name={candidate.name} party={candidate.party} className="w-16 h-16 text-lg" />
          <DialogTitle className="font-display text-lg mt-2">{candidate.name}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">{candidate.position}</DialogDescription>
          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold mt-1 ${styles.badge}`}>
            {candidate.party}
          </span>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1.5">Key Policies</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.policies.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-background text-foreground border border-border">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1">Why they match your interests</p>
            <p className="text-[12px] text-foreground leading-relaxed">{candidate.relevance_reason}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[11px] text-muted-foreground font-semibold">Relevance</span>
            <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${candidate.relevance_score}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-foreground">{candidate.relevance_score}%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailDialog;
