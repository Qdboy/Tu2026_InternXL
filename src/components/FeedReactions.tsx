import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Reaction = "👍" | "👎" | "😡" | "😢" | "🙏";

const reactions: { emoji: Reaction; label: string }[] = [
  { emoji: "👍", label: "Like" },
  { emoji: "👎", label: "Dislike" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🙏", label: "Hopeful" },
];

const STORAGE_KEY = "votewise_reactions";

function getStoredReactions(): Record<string, Reaction | null> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function storeReaction(itemId: string, reaction: Reaction | null) {
  const all = getStoredReactions();
  if (reaction) {
    all[itemId] = reaction;
  } else {
    delete all[itemId];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

interface FeedReactionsProps {
  itemId: string;
}

const FeedReactions = ({ itemId }: FeedReactionsProps) => {
  const [selected, setSelected] = useState<Reaction | null>(null);

  useEffect(() => {
    const stored = getStoredReactions();
    setSelected(stored[itemId] || null);
  }, [itemId]);

  const handleReaction = (emoji: Reaction) => {
    const next = selected === emoji ? null : emoji;
    setSelected(next);
    storeReaction(itemId, next);
  };

  return (
    <div className="flex items-center gap-1">
      {reactions.map(({ emoji, label }) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 1.3 }}
          onClick={() => handleReaction(emoji)}
          title={label}
          className={`p-1.5 rounded-lg text-base transition-colors ${
            selected === emoji
              ? "bg-primary/10 ring-1 ring-primary/30"
              : "hover:bg-secondary"
          }`}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
};

export default FeedReactions;
