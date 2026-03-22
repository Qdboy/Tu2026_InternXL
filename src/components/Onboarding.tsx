import { useState } from "react";
import { ChevronLeft } from "lucide-react";
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

const INCOME_RANGES = [
  "Select range…",
  "Under $25,000",
  "$25,000 – $50,000",
  "$50,000 – $75,000",
  "$75,000 – $100,000",
  "$100,000 – $150,000",
  "Over $150,000",
];

export default function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const { saveResidential } = useUserLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [occupation, setOccupation] = useState("");
  const [income, setIncome] = useState("");
  const [address, setAddress] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["🏥 Healthcare", "💰 Economy", "🏘️ Housing"]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = () => {
    const parts = address.split(",").map((p) => p.trim());
    const city = parts[1] || "Atlanta";
    const state = parts[2]?.split(" ")[0] || "GA";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveResidential({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: parts[0] || address,
          city,
          state,
        });
        onComplete();
      },
      () => {
        saveResidential({
          lat: 33.749,
          lng: -84.388,
          address: parts[0] || "123 Main St",
          city,
          state,
        });
        onComplete();
      }
    );
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
                i < doneSteps
                  ? "bg-gradient-to-r from-primary to-accent"
                  : "bg-card/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">First Name</label>
              <input
                className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none focus:border-orange-light transition-colors"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">Last Name</label>
              <input
                className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none focus:border-orange-light transition-colors"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">Date of Birth</label>
            <input
              className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none focus:border-orange-light transition-colors"
              placeholder="MM / DD / YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">Occupation</label>
            <input
              className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none focus:border-orange-light transition-colors"
              placeholder="e.g. Teacher, Engineer…"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">Annual Income Range</label>
            <select
              className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none appearance-none"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            >
              {INCOME_RANGES.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">Home Address</label>
            <input
              className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl font-body text-sm text-foreground outline-none focus:border-orange-light transition-colors"
              placeholder="123 Main St, City, State ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate uppercase tracking-[1.2px] mb-1.5 block">Areas of Interest</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`py-[7px] px-3.5 rounded-full border-2 text-[11px] font-bold cursor-pointer transition-all select-none ${
                    selectedInterests.includes(interest)
                      ? "bg-dark-char text-orange-light border-primary"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

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
