import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Link2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocSummary {
  id: string;
  name: string;
  summary: string | null;
  keyPoints: string[];
  processing: boolean;
  date: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [linkUrl, setLinkUrl] = useState("");

  const getUserProfile = () => {
    try {
      const stored = localStorage.getItem("politiu_user_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.profile || null;
      }
    } catch {}
    return null;
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string || "");
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const tempId = `doc-${Date.now()}-${file.name}`;

      setDocs(prev => [{
        id: tempId,
        name: file.name,
        summary: null,
        keyPoints: [],
        processing: true,
        date: "",
      }, ...prev]);

      try {
        const textContent = await readFileAsText(file);
        const profile = getUserProfile();

        const { data, error } = await supabase.functions.invoke("summarize-local", {
          body: {
            fileName: file.name,
            textContent,
            userProfile: profile,
          },
        });

        if (error) throw error;

        setDocs(prev => prev.map(d =>
          d.id === tempId
            ? {
                ...d,
                processing: false,
                summary: data.summary,
                keyPoints: data.keyPoints || [],
                date: `Summarized ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
              }
            : d
        ));

        toast.success(`"${file.name}" summarized!`);
      } catch (error: any) {
        console.error("Summarize error:", error);
        toast.error(`Failed to summarize "${file.name}"`);
        setDocs(prev => prev.filter(d => d.id !== tempId));
      }
    }

    e.target.value = "";
  };

  const handleLinkSummarize = async () => {
    const url = linkUrl.trim();
    if (!url) return;

    const tempId = `link-${Date.now()}`;
    const displayName = url.length > 50 ? url.substring(0, 50) + "…" : url;

    setDocs(prev => [{
      id: tempId,
      name: displayName,
      summary: null,
      keyPoints: [],
      processing: true,
      date: "",
    }, ...prev]);

    setLinkUrl("");

    try {
      const profile = getUserProfile();
      const { data, error } = await supabase.functions.invoke("summarize-url", {
        body: { url, userProfile: profile },
      });

      if (error) throw error;

      setDocs(prev => prev.map(d =>
        d.id === tempId
          ? {
              ...d,
              processing: false,
              summary: data.summary,
              keyPoints: data.keyPoints || [],
              date: `Summarized ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
            }
          : d
      ));

      toast.success("Link summarized!");
    } catch (error: any) {
      console.error("Link summarize error:", error);
      const msg = error?.context?.body ? (await error.context.json?.())?.error : null;
      toast.error(msg || "Failed to summarize link. Make sure you paste a web URL (https://...).");
      setDocs(prev => prev.filter(d => d.id !== tempId));
    }
  };

  const removeDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-dark-char px-5 py-4 flex-shrink-0">
        <h1 className="font-display text-xl font-bold text-on-dark">Documents</h1>
        <p className="text-xs text-on-dark/40 mt-0.5">AI-powered civic doc summarizer</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {/* Upload zone */}
          <div className="border-2 border-dashed border-primary rounded-[20px] p-8 text-center bg-orange-pale mb-5 relative">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.csv"
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-[42px] mb-3">📋</div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1.5">Upload a Document</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              PDFs, bills, ballots, forum posts<br />We'll break it down for you
            </p>
            <div className="flex gap-2.5 justify-center flex-wrap pointer-events-none">
              <span className="py-2.5 px-5 rounded-[10px] text-xs font-extrabold font-body bg-dark-char text-on-dark border-2 border-dark-char inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload File
              </span>
            </div>
          </div>

          {/* Or divider */}
          <div className="text-center text-sage text-xs font-bold my-3.5 relative">
            <span className="relative z-10 bg-background px-3">or paste a link</span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -z-0" />
          </div>

          {/* Link input */}
          <div className="flex gap-2.5 mb-5">
            <input
              className="flex-1 py-3 px-3.5 border-2 border-border rounded-xl font-body text-[13px] text-foreground outline-none bg-card focus:border-orange-light transition-colors"
              placeholder="https://legis.ga.gov/bill/SB-1234…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <button
              className="py-3 px-4.5 bg-primary text-on-dark border-none rounded-xl font-body text-[13px] font-extrabold cursor-pointer hover:bg-burnt transition-colors whitespace-nowrap disabled:opacity-50"
              disabled={!linkUrl.trim()}
              onClick={handleLinkSummarize}
            >
              Summarize
            </button>
          </div>

          {/* Document summaries */}
          {docs.length > 0 && (
            <>
              <div className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-[1px] mb-3">
                Your Summaries
              </div>
              <div className="space-y-3">
                {docs.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="bg-card rounded-2xl p-4 shadow-[0_2px_10px_rgba(42,48,40,0.07)] border border-border">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-10 h-10 rounded-[10px] bg-dark-char flex items-center justify-center text-lg flex-shrink-0">
                          <FileText className="w-5 h-5 text-on-dark" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">{doc.name}</div>
                          {doc.date && <div className="text-[10px] text-sage mt-0.5">{doc.date}</div>}
                        </div>
                        <button
                          onClick={() => removeDoc(doc.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {doc.processing ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          AI is reading your document...
                        </div>
                      ) : (
                        <>
                          {doc.summary && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{doc.summary}</p>
                          )}
                          {doc.keyPoints.length > 0 && doc.keyPoints.map((point, j) => (
                            <div key={j} className="flex gap-[7px] items-start mb-1 text-[11px] text-muted-foreground font-semibold">
                              <span className="text-primary text-[9px] mt-0.5 flex-shrink-0">▸</span>
                              {point}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {docs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No documents yet. Upload one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
