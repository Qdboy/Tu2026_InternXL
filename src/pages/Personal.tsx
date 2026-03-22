import { useState } from "react";
import { toast } from "sonner";
import { useUserLocation } from "@/hooks/use-user-location";
import { useTheme } from "@/hooks/use-theme";

export default function PersonalPage({ onSignOut }: { onSignOut: () => void }) {
  const { location } = useUserLocation();
  const { theme, toggleTheme } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const address = location.residential
    ? `${location.residential.address}, ${location.residential.city}, ${location.residential.state}`
    : "1247 Peachtree St NE, Atlanta, GA 30309";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-dark-char px-5 pt-5 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <h1 className="font-display text-xl font-bold text-on-dark">Personal</h1>
          <button
            className="bg-transparent border-none cursor-pointer text-on-dark/55 hover:text-orange-light transition-colors text-xl"
            onClick={() => toast("Edit profile")}
          >
            ✏️
          </button>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-[58px] h-[58px] rounded-2xl bg-gradient-to-br from-orange-light to-burnt flex items-center justify-center font-display text-[22px] font-black text-on-dark shadow-[0_4px_16px_rgba(232,86,10,0.4)]">
            JD
          </div>
          <div>
            <div className="font-display text-xl font-bold text-on-dark">Jane Doe</div>
            <div className="text-[11px] text-on-dark/40 mt-0.5">Member since Jan 2026</div>
          </div>
        </div>
      </div>

      {/* Voter card */}
      <div className="mx-5 mt-4">
        <div className="bg-gradient-to-br from-dark-char to-[#354A35] rounded-[18px] p-[17px_18px] shadow-[0_8px_28px_rgba(0,0,0,0.25)] border border-accent/25">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-extrabold text-orange-light uppercase tracking-[1px]">🗳 Voter Registration</span>
            <span className="py-1 px-3 rounded-full text-[10px] font-extrabold bg-accent/20 text-accent border border-accent/35">
              ✓ Registered
            </span>
          </div>
          <div className="font-display text-lg font-bold text-on-dark mb-[3px]">Jane A. Doe</div>
          <div className="text-[11px] text-on-dark/45">{address}</div>
          <div className="flex justify-between mt-3 pt-3 border-t border-on-dark/10">
            <div>
              <div className="text-[9px] text-on-dark/35 uppercase tracking-[0.5px] mb-0.5">District</div>
              <div className="text-[13px] font-bold text-on-dark">GA-05</div>
            </div>
            <div>
              <div className="text-[9px] text-on-dark/35 uppercase tracking-[0.5px] mb-0.5">Party</div>
              <div className="text-[13px] font-bold text-on-dark">Non-Partisan</div>
            </div>
            <div>
              <div className="text-[9px] text-on-dark/35 uppercase tracking-[0.5px] mb-0.5">Polling Place</div>
              <div className="text-[13px] font-bold text-on-dark">Parks Rec Ctr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4">
          {/* My Information */}
          <SettingsSection title="My Information">
            <SettingsRow icon="👤" iconBg="bg-orange-pale" label="Personal Details" sub="Name, DOB, Occupation" />
            <SettingsRow icon="📍" iconBg="bg-mint" label="Address & District" sub="GA-05 · Fulton County" last />
          </SettingsSection>

          {/* Interests & Preferences */}
          <SettingsSection title="Interests & Preferences">
            <SettingsRow icon="⭐" iconBg="bg-orange-pale" label="Areas of Interest" sub="Healthcare, Economy, Housing" />
            <ToggleRow icon="🔔" iconBg="bg-mint" label="Notifications" sub="Breaking civic news alerts" value={notificationsOn} onToggle={() => setNotificationsOn(!notificationsOn)} />
            <ToggleRow icon="🌙" iconBg="bg-orange-pale" label="Dark Mode" sub={`Currently: ${theme === "dark" ? "Dark" : "Light"}`} value={theme === "dark"} onToggle={toggleTheme} last />
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Account">
            <SettingsRow icon="🔐" iconBg="bg-sage-light" label="Security & Privacy" sub="Password, data preferences" />
            <SettingsRow icon="❓" iconBg="bg-mint" label="Help & Support" />
            <button
              onClick={onSignOut}
              className="flex items-center w-full py-3.5 px-4 gap-3 cursor-pointer bg-transparent border-none transition-colors hover:bg-background"
            >
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#FFF0F0] flex items-center justify-center text-base flex-shrink-0">🚪</div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-destructive">Sign Out</div>
              </div>
              <span className="text-destructive text-sm font-bold">›</span>
            </button>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[1.2px] mb-2 px-0.5">{title}</div>
      <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(42,48,40,0.06)] border border-border">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, iconBg, label, sub, last }: { icon: string; iconBg: string; label: string; sub?: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center py-3.5 px-4 gap-3 cursor-pointer transition-colors hover:bg-background ${!last ? "border-b border-border" : ""}`}
      onClick={() => toast(`Opening ${label.toLowerCase()}…`)}
    >
      <div className={`w-[34px] h-[34px] rounded-[9px] ${iconBg} flex items-center justify-center text-base flex-shrink-0`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-foreground">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      <span className="text-sage text-sm font-bold">›</span>
    </div>
  );
}

function ToggleRow({ icon, iconBg, label, sub, value, onToggle, last }: { icon: string; iconBg: string; label: string; sub: string; value: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <div className={`flex items-center py-3.5 px-4 gap-3 ${!last ? "border-b border-border" : ""}`}>
      <div className={`w-[34px] h-[34px] rounded-[9px] ${iconBg} flex items-center justify-center text-base flex-shrink-0`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-[26px] rounded-full relative flex-shrink-0 cursor-pointer transition-colors border-none ${value ? "bg-primary" : "bg-border"}`}
      >
        <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-card shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all ${value ? "right-[3px]" : "left-[3px]"}`} />
      </button>
    </div>
  );
}
