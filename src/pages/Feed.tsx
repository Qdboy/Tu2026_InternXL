import { useState, useEffect, useCallback } from "react";
import politiULogo from "@/assets/PolitiULogo.png";
import { motion } from "framer-motion";
import LevelTag from "@/components/LevelTag";
import FeedReactions from "@/components/FeedReactions";
import { Card } from "@/components/ui/card";
import { MessageSquare, Share2, Bookmark, Sparkles, ChevronDown, ChevronUp, Loader2, Bell, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Level = "local" | "state" | "federal";

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  level: Level;
  relevant_office: string;
  source: string | null;
  tags: string[] | null;
  created_at: string;
}

interface UserProfile {
  name: string;
  occupation: string;
  zipCode: string;
  interests: string[];
  transport: string[];
}

const filters: { label: string; value: Level | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Local", value: "local" },
  { label: "State", value: "state" },
  { label: "Federal", value: "federal" },
];

const tagColors: Record<string, string> = {
  Economy: "bg-orange-pale text-burnt",
  Healthcare: "bg-mint text-muted-foreground",
  Education: "bg-[hsl(120,40%,92%)] text-forest",
  Environment: "bg-[hsl(110,40%,93%)] text-olive",
  Housing: "bg-orange-pale text-primary",
  Transportation: "bg-mint text-muted-foreground",
  Immigration: "bg-[hsl(120,40%,92%)] text-forest",
  "Criminal Justice": "bg-orange-pale text-burnt",
  Technology: "bg-mint text-muted-foreground",
  "Civil Rights": "bg-[hsl(110,40%,93%)] text-olive",
  Climate: "bg-[hsl(110,40%,93%)] text-olive",
};

const levelGradient: Record<Level, string> = {
  federal: "bg-gradient-to-br from-dark-surface to-[hsl(130,10%,22%)]",
  state: "bg-gradient-to-br from-forest to-[hsl(100,60%,30%)]",
  local: "bg-gradient-to-br from-burnt to-primary",
};

const Feed = () => {
  const [activeFilter, setActiveFilter] = useState<Level | "all">("all");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("politiu_user_location");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.profile) {
          setProfile(parsed.profile);
        } else if (parsed.residential) {
          setProfile({
            name: "",
            occupation: "",
            zipCode: parsed.residential.address || "",
            interests: [],
            transport: [],
          });
        }
      } catch { /* ignore */ }
    }
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feed_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setFeedItems((data as FeedItem[]) || []);
    } catch (e: any) {
      console.error("Feed fetch error:", e);
      toast({ title: "Couldn't load feed", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const generateArticles = async () => {
    if (!profile || generating) return;
    setGenerating(true);
    try {
      const existingTitles = feedItems.map((i) => i.title);
      const { data, error } = await supabase.functions.invoke("generate-feed", {
        body: { profile, existingTitles },
      });
      if (error) throw error;
      if (data?.items) {
        setFeedItems((prev) => [...data.items, ...prev]);
        toast({ title: "New articles generated!", description: `${data.items.length} personalized articles added to your feed.` });
      }
    } catch (e: any) {
      console.error("Generate feed error:", e);
      toast({ title: "Couldn't generate articles", description: e?.message || "Please try again later.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const fetchPersonalizedSummary = async (item: FeedItem) => {
    if (aiSummaries[item.id] || loadingIds.has(item.id) || !profile) return;
    setLoadingIds((prev) => new Set(prev).add(item.id));
    try {
      const { data, error } = await supabase.functions.invoke("personalize-feed", {
        body: {
          feedItem: { title: item.title, summary: item.summary, level: item.level, relevantOffice: item.relevant_office },
          profile,
        },
      });
      if (error) throw error;
      setAiSummaries((prev) => ({ ...prev, [item.id]: data.summary }));
    } catch (e: any) {
      console.error("AI summary error:", e);
      toast({ title: "Couldn't generate summary", description: e?.message || "Please try again later.", variant: "destructive" });
    } finally {
      setLoadingIds((prev) => { const next = new Set(prev); next.delete(item.id); return next; });
    }
  };

  const toggleExpand = (item: FeedItem) => {
    if (expandedId === item.id) { setExpandedId(null); } else { setExpandedId(item.id); fetchPersonalizedSummary(item); }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filtered = activeFilter === "all" ? feedItems : feedItems.filter((item) => item.level === activeFilter);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Dark header */}
      <div className="bg-dark-surface px-5 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3.5">
           <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center overflow-hidden">
              <img src={politiULogo} alt="Politi-U" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="font-display font-black text-on-dark text-xl">Politi-<span className="text-orange-light">U</span></h1>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <button
                onClick={generateArticles}
                disabled={generating}
                className="text-orange-light hover:text-orange-light/80 transition-colors disabled:opacity-50"
                title="Generate new personalized articles"
              >
                <RefreshCw className={`w-5 h-5 ${generating ? "animate-spin" : ""}`} />
              </button>
            )}
            <Bell className="w-5 h-5 text-on-dark/50" />
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2.5 rounded-t-2xl text-[11px] font-extrabold tracking-wide whitespace-nowrap transition-colors ${
                activeFilter === f.value ? "bg-background text-dark-surface" : "text-on-dark/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-4">
          <p className="text-muted-foreground text-sm">No articles yet.</p>
          {profile && (
            <button onClick={generateArticles} disabled={generating} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">
              {generating ? "Generating..." : "Generate personalized articles"}
            </button>
          )}
        </div>
      ) : (
        <div className="px-3.5 pt-3.5 space-y-3 pb-6">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="rounded-2xl overflow-hidden shadow-sm border-border">
                <div className={`h-32 relative overflow-hidden flex items-end p-3 ${levelGradient[item.level as Level]}`}>
                  <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(55deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px)" }} />
                  <LevelTag level={item.level as Level} />
                </div>
                <div className="p-3.5">
                  <h3 className="font-display font-bold text-foreground leading-tight text-[15px] mb-1.5">{item.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{item.source || "News"}</span>
                    <span className="text-[10px] text-sage">{timeAgo(item.created_at)}</span>
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${tagColors[tag] || "bg-secondary text-secondary-foreground"}`}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {profile && (
                    <button onClick={() => toggleExpand(item)} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      How this affects you
                      {expandedId === item.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {expandedId === item.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-orange-pale border border-primary/10 p-3 mt-2">
                      {loadingIds.has(item.id) ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Personalizing for you...</div>
                      ) : aiSummaries[item.id] ? (
                        <p className="text-sm text-foreground leading-relaxed">{aiSummaries[item.id]}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Unable to load summary.</p>
                      )}
                    </motion.div>
                  )}
                </div>
                <div className="px-3.5 py-2 border-t border-border">
                  <FeedReactions itemId={item.id} />
                </div>
                <div className="flex items-center gap-3.5 px-3.5 py-2.5 border-t border-border">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Read more
                  </a>
                  <button className="flex items-center gap-1.5 text-[11px] font-semibold text-sage"><MessageSquare className="w-3.5 h-3.5" /> Discuss</button>
                  <button className="flex items-center gap-1.5 text-[11px] font-semibold text-sage"><Share2 className="w-3.5 h-3.5" /> Share</button>
                  <button className="flex items-center gap-1.5 text-[11px] font-semibold text-sage ml-auto"><Bookmark className="w-3.5 h-3.5" /> Save</button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
