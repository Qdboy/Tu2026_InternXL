import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Level = "local" | "state" | "federal";

const levelStyles: Record<Level, string> = {
  local: "bg-orange-pale text-burnt border-transparent",
  state: "bg-mint text-forest border-transparent",
  federal: "bg-dark-surface text-orange-light border-transparent",
};

const LevelTag = ({ level }: { level: Level }) => {
  return (
    <Badge variant="outline" className={cn("text-[9px] font-extrabold uppercase tracking-widest rounded-full px-2.5 py-1", levelStyles[level])}>
      {level}
    </Badge>
  );
};

export default LevelTag;
