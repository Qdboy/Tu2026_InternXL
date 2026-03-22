import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import CandidateAvatar from "@/components/CandidateAvatar";
import { Candidate, getPartyStyle } from "./types";

function getVideoForCandidate(name: string) {
  // Show video for ~40% of candidates based on name hash
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (hash % 5 > 1) return null; // ~60% get no video

  const thumbnails = [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80",
    "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&q=80",
    "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=80",
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&q=80",
  ];
  const durations = ["3:21", "4:32", "5:48", "6:15", "2:58"];
  const firstName = name.split(" ")[0];
  const lastName = name.split(" ").pop();

  return {
    title: `${name} on the Issues`,
    thumbnail: thumbnails[hash % thumbnails.length],
    duration: durations[hash % durations.length],
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+campaign`,
  };
}

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CandidateDetailDialog = ({ candidate, open, onOpenChange }: Props) => {
  if (!candidate) return null;
  const styles = getPartyStyle(candidate.party);
  const video = getVideoForCandidate(candidate.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="items-center text-center pb-2">
          <CandidateAvatar name={candidate.name} party={candidate.party} className="w-16 h-16 text-lg" />
          <DialogTitle className="font-display text-lg mt-2">{candidate.name}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">{candidate.position}</DialogDescription>
          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold mt-1 ${styles.badge}`}>
            {candidate.party}
          </span>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Video section */}
          {video && (
            <div>
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-1.5">📹 Featured Video</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden relative group cursor-pointer"
              >
                <img src={video.thumbnail} alt={video.title} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-dark-char/40 group-hover:bg-dark-char/55 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-on-dark fill-on-dark ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                  <p className="text-[11px] font-bold text-on-dark leading-tight drop-shadow">{video.title}</p>
                  <span className="text-[9px] font-bold text-on-dark bg-dark-char/70 px-1.5 py-0.5 rounded shrink-0 ml-2">{video.duration}</span>
                </div>
              </a>
            </div>
          )}

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

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailDialog;
