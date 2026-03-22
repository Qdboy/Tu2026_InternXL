import { Search, Bell } from "lucide-react";

export default function AppBar() {
  return (
    <div className="bg-dark-char px-5 h-16 flex items-center justify-between flex-shrink-0 border-b-2 border-accent/18 relative z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-card p-[3px] flex items-center justify-center">
          <span className="font-display text-lg font-black text-foreground">
            P<span className="text-primary">U</span>
          </span>
        </div>
        <span className="font-display text-[22px] font-black text-card">
          Politi<span className="text-orange-light">U</span>
        </span>
      </div>
      <div className="flex gap-3.5 items-center">
        <button className="bg-transparent border-none cursor-pointer p-1 text-card/55 hover:text-orange-light transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="bg-transparent border-none cursor-pointer p-1 text-card/55 hover:text-orange-light transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
