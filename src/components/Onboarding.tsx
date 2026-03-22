import { useState } from "react";
import { ChevronLeft, MapPin, Loader2 } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";

interface OnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

const INTERESTS = [
  "🏥 Healthcare",
  "💰 Economy",
  "🎓 Education",
  "🌿 Environment",
  "🏘️ Housing",
  "🔒 Public Safety",
  "🚦 Infrastructure",
  "⚖️ Civil Rights",
  "🌍 Foreign Policy",
  "🧾 Tax Policy",
];

const TRANSPORT_MODES = [
  "🚗 Car",
  "🚌 Public Transit",
  "🚴 Bicycle",
  "🚶 Walking",
  "🛴 Scooter / E-bike",
  "🚕 Rideshare",
];

const INCOME_RANGES = [
  "",
  "Under $11,600",
  "$11,600 – $47,150",
  "$47,150 – $100,525",
  "$100,525 – $191,950",
  "$191,950 – $243,725",
  "$243,725 – $609,350",
  "Over $609,350",
];

const INCOME_LABELS: Record<string, string> = {
  "Under $11,600": "10% bracket",
  "$11,600 – $47,150": "12% bracket",
  "$47,150 – $100,525": "22% bracket",
  "$100,525 – $191,950": "24% bracket",
  "$191,950 – $243,725": "32% bracket",
  "$243,725 – $609,350": "35% bracket",
  "Over $609,350": "37% bracket",
};

/* ─── Styled field label ─── */
function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 flex items-center gap-1.5">
      {children}
      {optional && (
        <span className="normal-case tracking-normal font-semibold text-muted-foreground/60 text-[9px]">
          (optional)
        </span>
      )}
    </label>
  );
}

/* ─── Styled text input ─── */
function StyledInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none focus:border-orange-light transition-colors"
    />
  );
}

/* ─── Chip toggle ─── */
function ChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`py-[7px] px-3.5 rounded-full border-2 text-[11px] font-bold cursor-pointer transition-all select-none ${
        selected
          ? "bg-dark-char text-orange-light border-primary"
          : "bg-card text-muted-foreground border-border"
      }`}
    >
      {label}
    </button>
  );
}

export default function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const { saveResidential } = useUserLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [occupation, setOccupation] = useState("");
  const [income, setIncome] = useState("");
  const [address, setAddress] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "🏥 Healthcare",
    "💰 Economy",
    "🏘️ Housing",
  ]);
  const [selectedTransport, setSelectedTransport] = useState<string[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoGranted, setGeoGranted] = useState(false);

  const toggleChip = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse-geocode to fill address
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await resp.json();
          const a = data.address || {};
          const street = [a.house_number, a.road].filter(Boolean).join(" ");
          const city = a.city || a.town || a.village || "";
          const state = a.state || "";
          const zip = a.postcode || "";
          setAddress(`${street}, ${city}, ${state} ${zip}`.replace(/^,\s*/, ""));
        } catch {
          // Fallback — just note coordinates
          setAddress(`Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        }
        setGeoGranted(true);
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(err.message);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    const parts = address.split(",").map((p) => p.trim());
    const city = parts[1] || "Atlanta";
    const stateZip = parts[2] || "GA";
    const state = stateZip.split(" ")[0] || "GA";
    const zipCode = stateZip.split(" ")[1] || "";

    const saveAndComplete = (lat: number, lng: number) => {
      saveResidential({
        lat,
        lng,
        address: parts[0] || address,
        city,
        state,
      });
      const existingRaw = localStorage.getItem("politiu_user_location");
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      localStorage.setItem(
        "politiu_user_location",
        JSON.stringify({
          ...existing,
          residential: {
            ...(existing.residential || {}),
            lat,
            lng,
            address: parts[0] || address,
            city,
            state,
          },
          profile: {
            name: `${firstName} ${lastName}`.trim(),
            occupation,
            zipCode,
            county: city,
            interests: selectedInterests.map((i) => i.replace(/^[^\s]+\s/, "")),
            transport: selectedTransport.map((t) => t.replace(/^[^\s]+\s/, "")),
            income: income || undefined,
          },
        })
      );
      onComplete();
    };

    // If user typed an address manually, geocode it
    if (address.trim() && !geoGranted) {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
        );
        const results = await resp.json();
        if (results.length > 0) {
          saveAndComplete(parseFloat(results[0].lat), parseFloat(results[0].lon));
          return;
        }
      } catch { /* fall through */ }
    }

    // Use geolocation coords if available
    if (geoGranted) {
      navigator.geolocation.getCurrentPosition(
        (pos) => saveAndComplete(pos.coords.latitude, pos.coords.longitude),
        () => saveAndComplete(33.749, -84.388)
      );
    } else {
      saveAndComplete(33.749, -84.388);
    }
  };

  const steps = 5;
  const doneSteps = 2;

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <div className="bg-dark-char px-6 pt-5 pb-6 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-orange-light text-[13px] font-bold cursor-pointer mb-3.5 flex items-center gap-1 bg-transparent border-none"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-2xl font-bold text-on-dark">Set Up Your Profile</h1>
        <p className="text-xs text-on-dark/45 mt-1">Tell us about yourself to personalize your experience</p>

        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: steps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-[3px] rounded-full ${
                i < doneSteps ? "bg-gradient-to-r from-primary to-accent" : "bg-card/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Name */}
          <div className="flex gap-3">
            <div className="flex-1">
              <FieldLabel>First Name</FieldLabel>
              <StyledInput placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="flex-1">
              <FieldLabel>Last Name</FieldLabel>
              <StyledInput placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          {/* DOB */}
          <div>
            <FieldLabel>Date of Birth</FieldLabel>
            <StyledInput
              placeholder="MM / DD / YYYY"
              value={dob}
              inputMode="numeric"
              maxLength={14}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 8);
                let formatted = "";
                if (raw.length > 0) formatted = raw.slice(0, 2);
                if (raw.length >= 3) formatted += " / " + raw.slice(2, 4);
                if (raw.length >= 5) formatted += " / " + raw.slice(4, 8);
                setDob(formatted);
              }}
            />
          </div>

          {/* Occupation */}
          <div>
            <FieldLabel>Occupation</FieldLabel>
            <StyledInput placeholder="e.g. Teacher, Engineer…" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
          </div>

          {/* Income — optional */}
          <div>
            <FieldLabel optional>Annual Income Range</FieldLabel>
            <div className="relative">
              <select
                className="w-full py-3 px-4 bg-card border-2 border-border/60 border-dashed rounded-xl font-body text-sm text-foreground outline-none appearance-none focus:border-orange-light transition-colors"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {INCOME_RANGES.filter(Boolean).map((range) => (
                  <option key={range} value={range}>
                    {range} — {INCOME_LABELS[range]}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Based on 2024 federal tax brackets. Helps tailor tax-policy content.
            </p>
          </div>

          {/* Address + Geolocation */}
          <div>
            <FieldLabel>Residential Address</FieldLabel>
            <StyledInput
              placeholder="123 Main St, City, State ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-orange-light hover:text-primary transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
            >
              {geoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              {geoGranted ? "✓ Location detected — address filled" : "Use my current location"}
            </button>
            {geoError && <p className="text-[10px] text-destructive mt-1">{geoError}</p>}
          </div>

          {/* Interests */}
          <div>
            <FieldLabel>Areas of Interest</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <ChipToggle
                  key={interest}
                  label={interest}
                  selected={selectedInterests.includes(interest)}
                  onToggle={() => toggleChip(interest, selectedInterests, setSelectedInterests)}
                />
              ))}
            </div>
          </div>

          {/* Transport */}
          <div>
            <FieldLabel>Mode of Transport</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_MODES.map((mode) => (
                <ChipToggle
                  key={mode}
                  label={mode}
                  selected={selectedTransport.includes(mode)}
                  onToggle={() => toggleChip(mode, selectedTransport, setSelectedTransport)}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-[17px] bg-gradient-to-br from-orange-light to-burnt text-on-dark font-body text-[15px] font-extrabold border-none rounded-[14px] cursor-pointer uppercase tracking-[1.2px] mt-2 shadow-[0_8px_24px_rgba(232,86,10,0.3)] hover:translate-y-[-1px] transition-transform"
          >
            Complete Setup →
          </button>
        </div>
      </div>
    </div>
  );
}
