import { useState, useEffect } from "react";

interface CandidateAvatarProps {
  name: string;
  party: string;
  className?: string;
}

const partyRing: Record<string, string> = {
  Democrat: "ring-[#2c5282]",
  Republican: "ring-[#7B1E1E]",
  Independent: "ring-forest",
};

const partyBg: Record<string, string> = {
  Democrat: "bg-gradient-to-br from-[#2c5282] to-[#3a78b0]",
  Republican: "bg-gradient-to-br from-[#7B1E1E] to-[#A83232]",
  Independent: "bg-gradient-to-br from-forest to-olive",
};

function cleanNameForWikipedia(name: string): string {
  // Remove parenthetical suffixes like "(Incumbent)"
  let cleaned = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  // If name has " / " (running mates), take only the first person
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

  const ring = partyRing[party] || partyRing.Independent;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const bg = partyBg[party] || partyBg.Independent;

  // Show initials while loading
  if (loading) {
    return (
      <div className={`w-[52px] h-[52px] rounded-[14px] flex-shrink-0 ring-2 ${ring} ${bg} flex items-center justify-center animate-pulse ${className}`}>
        <span className="text-white font-bold text-lg">{initials}</span>
      </div>
    );
  }

  // Show image if available
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

  // Fallback: initials avatar
  return (
    <div className={`w-[52px] h-[52px] rounded-[14px] flex-shrink-0 ring-2 ${ring} ${bg} flex items-center justify-center ${className}`}>
      <span className="text-white font-bold text-lg">{initials}</span>
    </div>
  );
};

export default CandidateAvatar;
