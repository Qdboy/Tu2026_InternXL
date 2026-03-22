import { useState, useEffect } from "react";

interface CandidateAvatarProps {
  name: string;
  party: string;
  className?: string;
}

function getPartyKey(party: string): string {
  const p = party.toLowerCase();
  if (p.includes("democrat")) return "Democrat";
  if (p.includes("republican")) return "Republican";
  return "Independent";
}

const partyRing: Record<string, string> = {
  Democrat: "ring-[hsl(215,50%,35%)]",
  Republican: "ring-[hsl(0,50%,30%)]",
  Independent: "ring-[hsl(45,60%,40%)]",
};

const partyBg: Record<string, string> = {
  Democrat: "bg-gradient-to-br from-[hsl(215,50%,35%)] to-[hsl(215,55%,50%)]",
  Republican: "bg-gradient-to-br from-[hsl(0,50%,25%)] to-[hsl(0,55%,40%)]",
  Independent: "bg-gradient-to-br from-[hsl(45,50%,35%)] to-[hsl(45,50%,50%)]",
};

function cleanNameForWikipedia(name: string): string {
  let cleaned = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  if (cleaned.includes(" / ")) {
    cleaned = cleaned.split(" / ")[0].trim();
  }
  return cleaned;
}

async function fetchWikipediaImage(name: string): Promise<string | null> {
  try {
    const cleaned = cleanNameForWikipedia(name);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleaned)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

const CandidateAvatar = ({ name, party, className = "" }: CandidateAvatarProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setImageUrl(null);

    fetchWikipediaImage(name).then((url) => {
      if (!cancelled) {
        setImageUrl(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [name]);

  const key = getPartyKey(party);
  const ring = partyRing[key];
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const bg = partyBg[key];

  if (loading) {
    return (
      <div className={`w-[52px] h-[52px] rounded-[14px] flex-shrink-0 ring-2 ${ring} ${bg} flex items-center justify-center animate-pulse ${className}`}>
        <span className="text-primary-foreground font-bold text-lg">{initials}</span>
      </div>
    );
  }

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setFailed(true)}
        className={`w-[52px] h-[52px] rounded-[14px] flex-shrink-0 object-cover ring-2 ${ring} ${className}`}
      />
    );
  }

  return (
    <div className={`w-[52px] h-[52px] rounded-[14px] flex-shrink-0 ring-2 ${ring} ${bg} flex items-center justify-center ${className}`}>
      <span className="text-primary-foreground font-bold text-lg">{initials}</span>
    </div>
  );
};

export default CandidateAvatar;
