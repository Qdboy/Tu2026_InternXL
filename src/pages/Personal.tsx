import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserLocation } from "@/hooks/use-user-location";
import { useTheme } from "@/hooks/use-theme";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

const TIGERWEB_CD_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0/query";

async function fetchDistrict(lng: number, lat: number) {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "BASENAME,GEOID,CD119,STATE,NAME",
    returnGeometry: "false",
    f: "json",
  });
  try {
    const res = await fetch(`${TIGERWEB_CD_URL}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features?.length) return null;
    const p = data.features[0].attributes;
    return p.NAME || p.BASENAME || `District ${p.CD119}`;
  } catch {
    return null;
  }
}

export default function PersonalPage({ onSignOut }: { onSignOut: () => void }) {
  const { location, updateLocation } = useUserLocation();
  const { theme, toggleTheme } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const stored = localStorage.getItem("politiu_user_location");
  const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
  const profile = parsed?.profile;
  const displayName = profile?.name || "Jane Doe";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = format(new Date(), "MMM yyyy");

  const address = location.residential
    ? `${location.residential.address}, ${location.residential.city}, ${location.residential.state}`
    : "1247 Peachtree St NE, Atlanta, GA 30309";

  const city = location.residential?.city || "Atlanta";
  const state = location.residential?.state || "GA";

  useEffect(() => {
    if (location.residential) {
      fetchDistrict(location.residential.lng, location.residential.lat).then((name) => {
        if (name) setDistrictName(name);
      });
    }
  }, [location.residential?.lat, location.residential?.lng]);

  const districtShort = districtName || `${state}-05`;

  const handleAddressUpdate = async () => {
    if (!newAddress.trim()) return;
    setUpdatingLocation(true);
    try {
      await updateLocation(newAddress);
      setEditingAddress(false);
      setNewAddress("");
      setDistrictName(null); // will re-fetch
      toast.success("Location updated! Your feed and events will refresh.");
    } catch {
      toast.error("Couldn't update location. Please try again.");
    } finally {
      setUpdatingLocation(false);
    }
  };

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
            {initials}
          </div>
          <div>
            <div className="font-display text-xl font-bold text-on-dark">{displayName}</div>
            <div className="text-[11px] text-on-dark/40 mt-0.5">Member since {memberSince}</div>
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
          <div className="font-display text-lg font-bold text-on-dark mb-[3px]">{displayName}</div>
          <div className="text-[11px] text-on-dark/45">{address}</div>
          <div className="flex justify-between mt-3 pt-3 border-t border-on-dark/10">
            <div>
              <div className="text-[9px] text-on-dark/35 uppercase tracking-[0.5px] mb-0.5">District</div>
              <div className="text-[13px] font-bold text-on-dark">{districtShort}</div>
            </div>
            <div>
              <div className="text-[9px] text-on-dark/35 uppercase tracking-[0.5px] mb-0.5">City</div>
              <div className="text-[13px] font-bold text-on-dark">{city}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit address section */}
      {editingAddress && (
        <div className="mx-5 mt-3 p-4 bg-card rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Update Your Address</span>
          </div>
          <Input
            placeholder="e.g. 123 Main St, Chicago, IL 60601"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddressUpdate()}
            className="text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddressUpdate}
              disabled={updatingLocation || !newAddress.trim()}
              className="flex-1 py-2 rounded-xl bg-gradient-to-br from-orange-light to-burnt text-on-dark text-xs font-extrabold border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {updatingLocation ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</> : "Update Location"}
            </button>
            <button
              onClick={() => { setEditingAddress(false); setNewAddress(""); }}
              className="py-2 px-4 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold border-none cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4">
          <SettingsSection title="My Information">
            <SettingsRow icon="👤" iconBg="bg-orange-pale" label="Personal Details" sub={`${displayName} · ${profile?.occupation || "N/A"}`} />
            <div
              className="flex items-center py-3.5 px-4 gap-3 cursor-pointer transition-colors hover:bg-background"
              onClick={() => setEditingAddress(true)}
            >
              <div className="w-[34px] h-[34px] rounded-[9px] bg-mint flex items-center justify-center text-base flex-shrink-0">📍</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground">Address & District</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{districtShort} · {city}, {state}</div>
              </div>
              <span className="text-primary text-[10px] font-bold">Edit</span>
            </div>
          </SettingsSection>

          <SettingsSection title="Interests & Preferences">
            <SettingsRow icon="⭐" iconBg="bg-orange-pale" label="Areas of Interest" sub={profile?.interests?.join(", ") || "Not set"} />
            <ToggleRow icon="🔔" iconBg="bg-mint" label="Notifications" sub="Breaking civic news alerts" value={notificationsOn} onToggle={() => setNotificationsOn(!notificationsOn)} />
            <ToggleRow icon="🌙" iconBg="bg-orange-pale" label="Dark Mode" sub={`Currently: ${theme === "dark" ? "Dark" : "Light"}`} value={theme === "dark"} onToggle={toggleTheme} last />
          </SettingsSection>

          <SettingsSection title="Account">
            <SettingsRow icon="🔐" iconBg="bg-sage-light" label="Security & Privacy" sub="Password, data preferences" />
            <SettingsRow icon="❓" iconBg="bg-mint" label="Help & Support" />
            <button
              onClick={onSignOut}
              className="flex items-center w-full py-3.5 px-4 gap-3 cursor-pointer bg-transparent border-none transition-colors hover:bg-background"
            >
              <div className="w-[34px] h-[34px] rounded-[9px] bg-destructive/10 flex items-center justify-center text-base flex-shrink-0">🚪</div>
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
