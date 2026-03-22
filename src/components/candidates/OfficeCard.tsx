import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import CandidateAvatar from "@/components/CandidateAvatar";
import LevelTag from "@/components/LevelTag";
import { Recommendation, partyStyles } from "./types";

interface Props {
  office: Recommendation;
  index: number;
  onSelect: (office: Recommendation) => void;
}

const OfficeCard = ({ office, index, onSelect }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card
        className="rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
        onClick={() => onSelect(office)}
      >
        <div className="flex items-center gap-2 mb-3">
          <LevelTag level={office.level} />
          <h3 className="font-display text-[14px] font-bold text-foreground flex-1">{office.office}</h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>

        {/* Side-by-side candidate previews */}
        <div className="grid grid-cols-2 gap-2">
          {office.candidates.slice(0, 4).map((c, i) => {
            const styles = partyStyles[c.party] || partyStyles.Independent;
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl bg-secondary/30 p-2"
              >
                <CandidateAvatar name={c.name} party={c.party} className="w-8 h-8 text-[10px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-foreground truncate">{c.name}</p>
                  <span className={`inline-block px-1.5 py-px rounded-full text-[8px] font-extrabold ${styles.badge}`}>
                    {c.party}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {office.candidates.length > 4 && (
          <p className="text-[10px] text-muted-foreground text-center mt-2 font-semibold">
            +{office.candidates.length - 4} more
          </p>
        )}
      </Card>
    </motion.div>
  );
};

export default OfficeCard;
